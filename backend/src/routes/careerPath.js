const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Load career promotion data
const careerData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../career_promotion_salary.json'), 'utf8'));

// Google Gemini API configuration
const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Utility function to call Google Gemini API
async function queryGemini(prompt) {
  try {
    console.log('🤖 Calling Google Gemini API...');
    console.log('🔑 API Key present:', !!GOOGLE_GEMINI_API_KEY);
    console.log('🔗 URL:', GEMINI_BASE_URL);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: `You are a career advisor AI that provides detailed career path analysis. Respond with practical career advice.

${prompt}

Please provide a detailed response with:
- Direct answers to the question
- Specific examples and salary data for Indian market (in LPA)
- Clear formatting with bullet points
- Actionable advice
- Opportunities in Jammu & Kashmir region`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    };

    console.log('📤 Request body preview:', JSON.stringify(requestBody).substring(0, 300) + '...');

    const response = await fetch(`${GEMINI_BASE_URL}?key=${GOOGLE_GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`📥 Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;
      console.log(`✅ Success! Response length:`, aiResponse.length);
      console.log('📝 Response preview:', aiResponse.substring(0, 200) + '...');
      return aiResponse;
    } else {
      const errorText = await response.text();
      console.log(`❌ Error: ${response.status} - ${errorText}`);
      throw new Error(`Google Gemini API error: ${response.status} - ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Google Gemini API Error:', error);
    throw error;
  }
}

// Generate career path for a specific role
router.post('/generate', async (req, res) => {
  let role, roleData; // Declare variables outside try-catch
  
  try {
    role = req.body.role;
    const { userProfile } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    console.log(`🎯 Generating career path for role: ${role}`);

    // Check if role exists in our data
    roleData = careerData.find(item => 
      item.role && item.role.toLowerCase() === role.toLowerCase()
    );

    // If role not found in data, try partial match
    if (!roleData) {
      roleData = careerData.find(item => 
        item.role && item.role.toLowerCase().includes(role.toLowerCase())
      );
    }

    let prompt;
    if (roleData) {
      // Use structured data if available
      console.log(`📊 Using structured data for role: ${roleData.role}`);
      
      prompt = `Generate a comprehensive career path analysis for ${role} based on this data:

Role: ${roleData.role}
Starting Salary: ₹${roleData.starting_salary || 'N/A'}
Mid-Level Salary: ₹${roleData.mid_level_salary || 'N/A'}
Senior-Level Salary: ₹${roleData.senior_level_salary || 'N/A'}
Skills Required: ${roleData.skills_required ? roleData.skills_required.join(', ') : 'N/A'}

Please provide:
1. Career progression timeline with salary expectations
2. Essential skills and qualifications
3. Industry opportunities in India, especially in Jammu & Kashmir
4. Educational pathways and certifications
5. Day-to-day responsibilities
6. Growth potential and future outlook

Format the response as JSON with the following structure:
{
  "careerTitle": "${role}",
  "overview": "Brief overview paragraph",
  "careerProgression": [
    {
      "level": "Entry Level",
      "experience": "0-2 years",
      "salary": "X-Y LPA",
      "responsibilities": ["responsibility1", "responsibility2"],
      "skills": ["skill1", "skill2"]
    }
  ],
  "education": {
    "degrees": ["degree1", "degree2"],
    "certifications": ["cert1", "cert2"],
    "skillDevelopment": ["skill1", "skill2"]
  },
  "industryInsights": {
    "demand": "Market demand description",
    "growth": "Growth prospects",
    "opportunities": "Job opportunities"
  },
  "regionalOpportunities": {
    "jammukashmir": "Opportunities in J&K region",
    "companies": ["company1", "company2"]
  },
  "nextSteps": ["step1", "step2", "step3"]
}`;
    } else {
      // Generate based on general knowledge
      console.log(`🧠 Using AI knowledge for role: ${role}`);
      
      prompt = `Generate a comprehensive career path analysis for ${role}. Please provide:

1. Career progression timeline with salary expectations in Indian market (LPA)
2. Essential skills and qualifications needed
3. Industry opportunities, especially in Jammu & Kashmir region
4. Educational pathways and certifications
5. Day-to-day responsibilities at different levels
6. Growth potential and future outlook

Format the response as JSON with the following structure:
{
  "careerTitle": "${role}",
  "overview": "Brief overview paragraph",
  "careerProgression": [
    {
      "level": "Entry Level",
      "experience": "0-2 years",
      "salary": "X-Y LPA",
      "responsibilities": ["responsibility1", "responsibility2"],
      "skills": ["skill1", "skill2"]
    }
  ],
  "education": {
    "degrees": ["degree1", "degree2"],
    "certifications": ["cert1", "cert2"],
    "skillDevelopment": ["skill1", "skill2"]
  },
  "industryInsights": {
    "demand": "Market demand description",
    "growth": "Growth prospects",
    "opportunities": "Job opportunities"
  },
  "regionalOpportunities": {
    "jammukashmir": "Opportunities in J&K region",
    "companies": ["company1", "company2"]
  },
  "nextSteps": ["step1", "step2", "step3"]
}`;
    }

    // Call AI API
    console.log('🚀 Calling AI for career path generation...');
    let aiResponse = await queryGemini(prompt);

    // Clean up the response - remove markdown formatting and extract valid JSON
    if (aiResponse.includes('```json')) {
      aiResponse = aiResponse.replace(/```json\s*/g, '').replace(/\s*```/g, '').trim();
    }
    if (aiResponse.includes('```')) {
      aiResponse = aiResponse.replace(/```\s*/g, '').replace(/\s*```/g, '').trim();
    }

    // Extract JSON object more robustly
    let jsonStart = aiResponse.indexOf('{');
    let jsonEnd = aiResponse.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      aiResponse = aiResponse.substring(jsonStart, jsonEnd + 1);
    }

    console.log('🧹 Cleaned AI response length:', aiResponse.length);
    console.log('🧹 Cleaned AI response preview:', aiResponse.substring(0, 300) + '...');

    try {
      const careerPath = JSON.parse(aiResponse);
      console.log('✅ Successfully parsed JSON career path');
      res.json({
        success: true,
        careerPath: careerPath,
        source: roleData ? 'structured_data' : 'ai_generated'
      });
    } catch (jsonError) {
      console.error('❌ JSON Parse Error:', jsonError.message);
      console.log('🔍 Raw response causing error:', aiResponse);
      
      // Fallback to basic structure
      const fallbackCareer = generateFallbackCareer(role, roleData);
      res.json({
        success: true,
        careerPath: fallbackCareer,
        source: 'fallback',
        note: 'Using fallback due to AI response formatting issue'
      });
    }

  } catch (error) {
    console.error('Career Path Generation Error:', error);
    
    // Generate fallback career path
    const fallbackCareer = generateFallbackCareer(role, roleData);
    
    res.json({
      success: true,
      careerPath: fallbackCareer,
      source: 'fallback',
      error: error.message
    });
  }
});

// Function to generate fallback career path
function generateFallbackCareer(role, roleData) {
  const defaultSalary = roleData ? {
    entry: roleData.starting_salary || '3-5 LPA',
    mid: roleData.mid_level_salary || '6-12 LPA', 
    senior: roleData.senior_level_salary || '15-25 LPA'
  } : {
    entry: '3-5 LPA',
    mid: '6-12 LPA',
    senior: '15-25 LPA'
  };

  return {
    careerTitle: role,
    overview: `${role} is a dynamic field with good growth prospects in India, especially with the digital transformation happening across industries.`,
    careerProgression: [
      {
        level: 'Entry Level',
        experience: '0-2 years',
        salary: defaultSalary.entry,
        responsibilities: ['Learn fundamental concepts', 'Work under supervision', 'Gain practical experience'],
        skills: roleData?.skills_required?.slice(0, 3) || ['Communication', 'Problem-solving', 'Technical skills']
      },
      {
        level: 'Mid Level',
        experience: '3-7 years',
        salary: defaultSalary.mid,
        responsibilities: ['Lead small projects', 'Mentor junior staff', 'Client interaction'],
        skills: roleData?.skills_required?.slice(0, 5) || ['Leadership', 'Project management', 'Advanced technical skills', 'Client relations', 'Strategic thinking']
      },
      {
        level: 'Senior Level',
        experience: '8+ years',
        salary: defaultSalary.senior,
        responsibilities: ['Strategic planning', 'Team leadership', 'Business development'],
        skills: ['Strategic leadership', 'Business acumen', 'Team management', 'Innovation', 'Industry expertise']
      }
    ],
    education: {
      degrees: ['Bachelor\'s degree in relevant field', 'Master\'s degree (preferred)', 'Professional certifications'],
      certifications: ['Industry-specific certifications', 'Professional development courses'],
      skillDevelopment: ['Continuous learning', 'Skill upgrading', 'Industry networking']
    },
    industryInsights: {
      demand: 'Growing demand in the Indian market',
      growth: 'Positive growth trajectory with digital transformation',
      opportunities: 'Multiple opportunities across various sectors'
    },
    regionalOpportunities: {
      jammukashmir: 'Emerging opportunities in J&K with government initiatives and digital infrastructure development',
      companies: ['Local businesses', 'Government sector', 'Startups', 'Remote opportunities']
    },
    nextSteps: [
      'Complete relevant education and certifications',
      'Build a strong portfolio',
      'Gain practical experience through internships',
      'Network with industry professionals',
      'Stay updated with industry trends'
    ]
  };
}

// Get available career roles
router.get('/roles', (req, res) => {
  try {
    const roles = careerData.map(item => ({
      role: item.role,
      category: item.category || 'General',
      starting_salary: item.starting_salary
    }));
    
    res.json({
      success: true,
      roles: roles
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Handle general career questions (chatbot functionality)
router.post('/question', async (req, res) => {
  try {
    const { question, userLanguage = 'en' } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    console.log(`🤖 Answering career question: ${question}`);
    console.log(`🌐 User language: ${userLanguage}`);

    // Call AI for general questions
    console.log('🤖 Calling AI for general question in language:', userLanguage);
    
    const prompt = `
You are an expert career advisor. Answer this career-related question with detailed, practical advice.

Question: "${question}"

Language Instructions: Respond in clear, professional English.

Context: You have access to comprehensive career data including salary ranges, promotion timelines, and industry insights for various roles in the Indian job market, specifically focusing on opportunities in Jammu & Kashmir region.

Please provide a helpful, detailed response that:
- Directly answers the user's question
- Provides specific examples and data where relevant  
- Offers actionable advice
- Uses clear formatting with bullet points and sections
- Includes salary figures in LPA (Lakhs Per Annum) for Indian market
- Suggests next steps or follow-up questions
- Considers opportunities and resources available in Jammu & Kashmir

Format your response in a conversational, helpful tone similar to a professional career counselor.
`;

    try {
      const aiResponse = await queryGemini(prompt);
      
      console.log('✅ AI Response received:', aiResponse.substring(0, 200) + '...');
      
      res.json({
        success: true,
        response: aiResponse,
        source: 'ai_generated'
      });

    } catch (aiError) {
      console.error('❌ AI Error:', aiError);
      
      // Provide fallback response
      const fallbackResponse = generateFallbackResponse(question);
      
      res.json({
        success: true,
        response: fallbackResponse,
        source: 'fallback'
      });
    }

  } catch (error) {
    console.error('Career Question Error:', error);
    res.status(500).json({ 
      error: 'Failed to process career question',
      details: error.message 
    });
  }
});

// Function to generate fallback responses for common career questions
function generateFallbackResponse(question) {
  const lowerQuestion = question.toLowerCase();
  
  // Define common career topics and their responses
  const responses = {
    'salary': `Here's a comprehensive career analysis for **Graphic Designer**:

🎨 **Career Overview**

Graphic Designer is a dynamic field with excellent growth prospects. Let me break down the complete career path for you.

### 📚 **Core Subjects & Skills**
- **Design Fundamentals**: Color theory, typography, composition, visual hierarchy
- **Software Mastery**: Adobe Creative Suite (Photoshop, Illustrator, InDesign, After Effects)
- **Web Design**: HTML/CSS basics, UI/UX principles, responsive design
- **Branding**: Logo design, brand identity, marketing materials
- **Print Design**: Layout design, print production, packaging design
- **Digital Media**: Social media graphics, digital advertising, motion graphics

### 💰 **Salary Progression in India**
- **Fresher (0-1 years)**: ₹2.5-4 LPA
- **Junior Designer (1-3 years)**: ₹4-7 LPA  
- **Mid-level Designer (3-6 years)**: ₹7-15 LPA
- **Senior Designer (6-10 years)**: ₹15-25 LPA
- **Art Director/Creative Lead (10+ years)**: ₹25-50 LPA

### 🎓 **Educational Path**
1. **Bachelor's Options**:
   - B.Des in Graphic Design
   - BFA in Applied Arts
   - B.Sc in Multimedia & Animation
   - Diploma in Graphic Design

2. **Specialization Courses**:
   - Adobe Certified Expert programs
   - UI/UX Design certification
   - Motion Graphics courses
   - Web Design bootcamps

### 🌍 **Opportunities in Jammu & Kashmir**
- **Government Projects**: Tourism promotion, cultural preservation campaigns
- **Local Businesses**: Handicrafts branding, tourism marketing
- **Remote Freelancing**: International clients, digital agencies
- **Startups**: Growing tech ecosystem in Srinagar and Jammu
- **Educational Institutions**: Design teaching opportunities

### 🚀 **Next Steps**
1. Build a strong portfolio showcasing diverse design work
2. Master industry-standard software tools
3. Gain hands-on experience through internships
4. Develop both creative and technical skills
5. Stay updated with current design trends

Would you like me to elaborate on any specific aspect of graphic design career?`,

    'compare': `I understand you're looking for career guidance. While I'm having trouble accessing the full AI system right now, I can still help with:

• Career path planning and role analysis
• Salary expectations and market insights  
• Education vs skills decisions
• Industry trends and opportunities

Could you rephrase your question or ask about a specific career topic? I'm here to provide detailed, helpful advice!`,
    
    'skills': `Here are the essential skills for career success:

**Technical Skills:**
- Industry-specific software and tools
- Data analysis and digital literacy
- Project management capabilities
- Communication and presentation skills

**Soft Skills:**
- Problem-solving and critical thinking
- Adaptability and continuous learning
- Leadership and teamwork
- Time management and organization

**For Jammu & Kashmir specifically:**
- Remote work capabilities are increasingly valuable
- Multilingual skills (English, Hindi, Urdu) are advantageous
- Understanding of local market dynamics
- Government sector knowledge for public service roles

Would you like me to focus on skills for a specific career field?`
  };

  // Find the most relevant response based on keywords
  for (const [keyword, response] of Object.entries(responses)) {
    if (lowerQuestion.includes(keyword)) {
      return response;
    }
  }

  // Default fallback response
  return `I understand you're looking for career guidance. While I'm having trouble accessing the full AI system right now, I can still help with:

• Career path planning and role analysis
• Salary expectations and market insights  
• Education vs skills decisions
• Industry trends and opportunities

Could you rephrase your question or ask about a specific career topic? I'm here to provide detailed, helpful advice!`;
}

module.exports = router;