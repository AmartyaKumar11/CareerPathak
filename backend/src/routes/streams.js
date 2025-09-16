const express = require('express');
const { PrismaClient } = require('../../generated/prisma');
const multer = require('multer');
const ocrService = require('../services/ocrService');
const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'));
    }
  }
});

// Simple OCR test route for debugging
router.post('/test-ocr', upload.single('marksheet'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Run OCR
    const ocrResult = await ocrService.extractTextFromFile(
      file.buffer,
      file.mimetype,
      file.originalname
    );

    // Parse marks
    let parsedMarks = null;
    if (ocrResult.success && ocrResult.extractedText) {
      const parseResult = await ocrService.parseMarksFromText(ocrResult.extractedText);
      if (parseResult.success) {
        parsedMarks = parseResult.parsedMarks;
      }
    }

    res.json({
      success: true,
      file: file.originalname,
      ocr: ocrResult,
      parsedMarks
    });
  } catch (error) {
    console.error('OCR test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload multiple marksheets with OCR processing
router.post('/upload-marksheets', upload.array('marksheets', 5), async (req, res) => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Process each file with OCR
    const processedFiles = [];
    
    for (const file of files) {
      console.log(`Processing file: ${file.originalname}`);
      
      // Extract text using OCR
      const ocrResult = await ocrService.extractTextFromFile(
        file.buffer, 
        file.mimetype, 
        file.originalname
      );

      let parsedMarks = null;
      if (ocrResult.success && ocrResult.extractedText) {
        // Parse marks from extracted text using AI
        const parseResult = await ocrService.parseMarksFromText(ocrResult.extractedText);
        if (parseResult.success) {
          parsedMarks = parseResult.parsedMarks;
        }
      }

      processedFiles.push({
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date(),
        ocrExtractedText: ocrResult.extractedText || '',
        ocrSuccess: ocrResult.success,
        ocrError: ocrResult.error || null,
        parsedMarks: parsedMarks,
        confidenceScore: parsedMarks?.confidence || 0
      });
    }

    // Store file metadata and extracted data
    await prisma.userStreamProfile.upsert({
      where: { userId },
      update: {
        uploadedFiles: processedFiles,
        updatedAt: new Date()
      },
      create: {
        userId,
        uploadedFiles: processedFiles
      }
    });

    // Return results with extracted marks
    const responseFiles = processedFiles.map(f => ({
      name: f.originalName,
      size: f.size,
      ocrSuccess: f.ocrSuccess,
      parsedMarks: f.parsedMarks,
      confidenceScore: f.confidenceScore,
      requiresManualEntry: !f.parsedMarks || f.confidenceScore < 0.7
    }));

    res.json({ 
      success: true, 
      message: `${files.length} marksheet(s) uploaded and processed`,
      files: responseFiles,
      autoExtractedCount: responseFiles.filter(f => !f.requiresManualEntry).length
    });

  } catch (error) {
    console.error('Upload marksheets error:', error);
    res.status(500).json({ error: 'Failed to upload and process marksheets' });
  }
});

// Store subject marks
router.post('/marks', async (req, res) => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const { marks } = req.body;

    // Store or update user's subject marks
    const userStreamProfile = await prisma.userStreamProfile.upsert({
      where: { userId },
      update: {
        subjectMarks: marks,
        updatedAt: new Date()
      },
      create: {
        userId,
        subjectMarks: marks
      }
    });

    res.json({ success: true, profile: userStreamProfile });
  } catch (error) {
    console.error('Store marks error:', error);
    res.status(500).json({ error: 'Failed to store marks' });
  }
});

// Generate AI-powered psychometric question
router.post('/generate-question', async (req, res) => {
  try {
    const { previousAnswers, subjectMarks, questionNumber } = req.body;
    const GEMINI_API_KEY = 'AIzaSyB0kTSIQzrwBwyY6eilji7p3uueb1erjgc';

    // Analyze user's academic profile
    const academicProfile = analyzeAcademicProfile(subjectMarks);
    
    // Build context for AI
    const context = buildQuestionContext(academicProfile, previousAnswers, questionNumber);

    // Call Gemini API to generate question
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: context
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 500,
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate question from Gemini API');
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // Parse AI response
    const questionData = parseAIResponse(aiResponse);
    
    res.json({
      questionId: `ai-q-${questionNumber}`,
      question: questionData.question,
      options: questionData.options,
      context: questionData.context,
      followUpTraits: questionData.traits,
      totalQuestions: 15
    });

  } catch (error) {
    console.error('Generate question error:', error);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

// Store psychometric test results
router.post('/psychometric', async (req, res) => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const { answers } = req.body;

    // Update user profile with psychometric results
    await prisma.userStreamProfile.update({
      where: { userId },
      data: {
        psychometricAnswers: answers,
        updatedAt: new Date()
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Store psychometric results error:', error);
    res.status(500).json({ error: 'Failed to store results' });
  }
});

// Get stream recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    
    // Get user's stream profile
    const userProfile = await prisma.userStreamProfile.findUnique({
      where: { userId }
    });

    if (!userProfile) {
      return res.json({ recommendations: [] });
    }

    // Get all available streams
    const streams = await getAvailableStreams();
    
    // Generate recommendations using AI
    const recommendations = await generateStreamRecommendations(userProfile, streams);
    
    res.json({ recommendations });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Helper function: Analyze academic profile
function analyzeAcademicProfile(marks) {
  const subjects = Object.keys(marks).filter(key => marks[key] > 0);
  const averageMarks = Object.values(marks).reduce((sum, mark) => sum + (mark || 0), 0) / subjects.length;
  
  let streamIndication = 'Mixed';
  const scienceSubjects = ['physics', 'chemistry', 'mathematics', 'biology'];
  const commerceSubjects = ['accountancy', 'businessStudies', 'economics'];
  const artsSubjects = ['history', 'geography', 'politicalScience', 'sociology'];

  const scienceCount = scienceSubjects.filter(sub => marks[sub] > 0).length;
  const commerceCount = commerceSubjects.filter(sub => marks[sub] > 0).length;
  const artsCount = artsSubjects.filter(sub => marks[sub] > 0).length;

  if (scienceCount >= 3) streamIndication = 'Science';
  else if (commerceCount >= 2) streamIndication = 'Commerce';
  else if (artsCount >= 2) streamIndication = 'Arts';

  return {
    subjects,
    averageMarks,
    streamIndication,
    strongSubjects: Object.entries(marks)
      .filter(([_, mark]) => mark >= 80)
      .map(([subject, _]) => subject),
    performance: averageMarks >= 85 ? 'Excellent' : averageMarks >= 70 ? 'Good' : 'Average'
  };
}

// Helper function: Build context for AI question generation
function buildQuestionContext(academicProfile, previousAnswers, questionNumber) {
  const answersContext = previousAnswers.length > 0 
    ? `Previous answers: ${previousAnswers.map(a => `Q: "${a.questionText}" A: "${a.answer}"`).join('; ')}`
    : 'No previous answers yet.';

  return `You are a career counseling AI generating personalized psychometric questions for Indian students.

Student Profile:
- Academic Stream: ${academicProfile.streamIndication}
- Average Marks: ${academicProfile.averageMarks.toFixed(1)}%
- Strong Subjects: ${academicProfile.strongSubjects.join(', ') || 'None identified'}
- Performance Level: ${academicProfile.performance}
- Question Number: ${questionNumber}/15

${answersContext}

Generate a psychometric question that:
1. Builds on previous answers to dig deeper into personality traits
2. Is relevant to Indian academic streams and career choices
3. Helps identify whether student fits Science/Engineering/Medical/Commerce/Arts streams
4. Explores personality traits like analytical thinking, creativity, leadership, service orientation

Return ONLY a JSON response with this exact format:
{
  "question": "Your question here",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"],
  "context": "Brief explanation of what this question explores",
  "traits": ["trait1", "trait2"]
}

Make the question engaging, relevant to Indian students, and progressively more specific based on their academic profile.`;
}

// Helper function: Parse AI response
function parseAIResponse(aiResponse) {
  try {
    // Remove any markdown formatting or extra text
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        question: parsed.question || 'Default question',
        options: parsed.options || ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        context: parsed.context || 'Exploring personality traits',
        traits: parsed.traits || ['general']
      };
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error);
  }
  
  // Fallback question
  return {
    question: 'How much do you enjoy solving complex problems that require logical thinking?',
    options: ['Not at all', 'Slightly', 'Moderately', 'Very much', 'Extremely'],
    context: 'Assessing analytical thinking preferences',
    traits: ['analytical', 'logical']
  };
}

// Helper function: Get available streams (placeholder - will use your dataset when available)
async function getAvailableStreams() {
  // This will be replaced with actual database query or your dataset
  return [
    {
      id: '1',
      name: 'Engineering (Computer Science)',
      category: 'Science',
      eligibility: { physics: 70, chemistry: 70, mathematics: 75 },
      entranceExams: ['JEE Main', 'JEE Advanced', 'BITSAT'],
      careers: ['Software Engineer', 'Data Scientist', 'AI Researcher', 'Product Manager'],
      personalityTraits: ['analytical', 'logical', 'innovative', 'problem-solving'],
      topColleges: ['IIT Delhi', 'IIT Bombay', 'BITS Pilani', 'IIT Kanpur'],
      salaryRange: '₹8-50 LPA'
    },
    {
      id: '2',
      name: 'Medical (MBBS)',
      category: 'Science',
      eligibility: { physics: 75, chemistry: 75, biology: 80 },
      entranceExams: ['NEET UG'],
      careers: ['Doctor', 'Surgeon', 'Medical Researcher', 'Public Health Expert'],
      personalityTraits: ['compassionate', 'detail-oriented', 'service-minded', 'patient'],
      topColleges: ['AIIMS Delhi', 'CMC Vellore', 'KGMU', 'JIPMER'],
      salaryRange: '₹10-100 LPA'
    },
    {
      id: '3',
      name: 'Commerce (CA/CS)',
      category: 'Commerce',
      eligibility: { accountancy: 70, businessStudies: 70, economics: 65 },
      entranceExams: ['CA Foundation', 'CS Foundation', 'CLAT'],
      careers: ['Chartered Accountant', 'Investment Banker', 'Financial Analyst', 'Company Secretary'],
      personalityTraits: ['analytical', 'detail-oriented', 'numerical', 'strategic'],
      topColleges: ['SRCC', 'LSR', 'Hansraj College', 'St. Xaviers Mumbai'],
      salaryRange: '₹6-25 LPA'
    },
    {
      id: '4',
      name: 'Liberal Arts',
      category: 'Arts',
      eligibility: { english: 70, history: 65, politicalScience: 65 },
      entranceExams: ['DUET', 'IPU CET', 'JMI Entrance'],
      careers: ['Civil Services', 'Journalist', 'Lawyer', 'Psychologist', 'Social Worker'],
      personalityTraits: ['communicative', 'empathetic', 'analytical', 'service-oriented'],
      topColleges: ['JNU', 'DU', 'BHU', 'Jadavpur University'],
      salaryRange: '₹4-20 LPA'
    }
  ];
}

// Helper function: Generate stream recommendations using AI analysis
async function generateStreamRecommendations(userProfile, streams) {
  const { subjectMarks, psychometricAnswers } = userProfile;
  
  const recommendations = streams.map(stream => {
    let score = 0;
    let reasoning = [];
    let eligibilityMet = true;

    // Check eligibility based on marks
    for (const [subject, minMarks] of Object.entries(stream.eligibility)) {
      const userMarks = subjectMarks[subject] || 0;
      if (userMarks < minMarks) {
        eligibilityMet = false;
        score -= 20;
      } else {
        score += (userMarks - minMarks) * 0.5;
        reasoning.push(`Strong performance in ${subject} (${userMarks}%)`);
      }
    }

    // Analyze psychometric fit
    if (psychometricAnswers && psychometricAnswers.length > 0) {
      const traitMatch = analyzeTraitCompatibility(psychometricAnswers, stream.personalityTraits);
      score += traitMatch.score;
      if (traitMatch.reasoning) {
        reasoning.push(traitMatch.reasoning);
      }
    }

    // Normalize score (0-100)
    score = Math.max(0, Math.min(100, score));

    return {
      id: stream.id,
      name: stream.name,
      category: stream.category,
      fitScore: score,
      eligibilityMet,
      eligibilityCriteria: stream.eligibility,
      entranceExams: stream.entranceExams,
      careers: stream.careers,
      personalityTraits: stream.personalityTraits,
      topColleges: stream.topColleges,
      salaryRange: stream.salaryRange,
      reasoning: reasoning.length > 0 ? reasoning.join('. ') : 'Based on your academic profile and interests.'
    };
  });

  // Sort by fit score
  return recommendations.sort((a, b) => b.fitScore - a.fitScore);
}

// Helper function: Analyze trait compatibility
function analyzeTraitCompatibility(answers, streamTraits) {
  let score = 0;
  let matchingTraits = [];

  // Simple trait matching logic (can be enhanced with AI)
  answers.forEach(answer => {
    const answerStrength = getAnswerStrength(answer.answer);
    
    // Match answer patterns to traits
    if (answer.questionText.toLowerCase().includes('analytical') || 
        answer.questionText.toLowerCase().includes('logical') ||
        answer.questionText.toLowerCase().includes('mathematical')) {
      if (streamTraits.includes('analytical') && answerStrength > 3) {
        score += 15;
        matchingTraits.push('analytical thinking');
      }
    }
    
    if (answer.questionText.toLowerCase().includes('creative') ||
        answer.questionText.toLowerCase().includes('art')) {
      if (streamTraits.includes('creative') && answerStrength > 3) {
        score += 15;
        matchingTraits.push('creativity');
      }
    }
    
    if (answer.questionText.toLowerCase().includes('helping') ||
        answer.questionText.toLowerCase().includes('service')) {
      if (streamTraits.includes('service-oriented') && answerStrength > 3) {
        score += 15;
        matchingTraits.push('service orientation');
      }
    }
  });

  return {
    score,
    reasoning: matchingTraits.length > 0 ? 
      `Your responses indicate strong ${matchingTraits.join(', ')} traits` : null
  };
}

// Helper function: Convert answer to numerical strength
function getAnswerStrength(answer) {
  const strengthMap = {
    'Strongly Disagree': 1, 'Not at all': 1,
    'Disagree': 2, 'Slightly': 2,
    'Neutral': 3, 'Moderately': 3,
    'Agree': 4, 'Very much': 4,
    'Strongly Agree': 5, 'Extremely': 5
  };
  
  return strengthMap[answer] || 3;
}

module.exports = router;