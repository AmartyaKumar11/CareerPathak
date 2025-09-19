const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Load career promotion data
const careerData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../career_promotion_salary.json'), 'utf8'));

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Utility function to call OpenRouter API
async function queryOpenRouter(prompt) {
  try {
    console.log('🤖 Calling OpenRouter API...');
    console.log('🔑 API Key present:', !!OPENROUTER_API_KEY);
    console.log('🔗 URL:', OPENROUTER_BASE_URL);
    
    // Use the working model we found
    const model = 'mistralai/mistral-7b-instruct:free';
    console.log(`🧪 Using model: ${model}`);
    
    const requestBody = {
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are a career advisor AI that provides detailed career path analysis based on data. Always respond with structured information about career progression, salary ranges, and required skills. Format your response as valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      stream: false
    };

    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(OPENROUTER_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'CareerPathak - Career Path Generator'
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`📥 Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Success! Response:`, data.choices[0].message.content.substring(0, 200) + '...');
      return data.choices[0].message.content;
    } else {
      const errorText = await response.text();
      console.log(`❌ Error: ${response.status} - ${errorText}`);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ OpenRouter API Error:', error);
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

    // Find the role in career data
    roleData = careerData.find(item => 
      item.Role.toLowerCase().includes(role.toLowerCase()) ||
      role.toLowerCase().includes(item.Role.toLowerCase())
    );

    if (!roleData) {
      return res.status(404).json({ error: 'Role not found in database' });
    }

    // Create comprehensive prompt for AI
    const prompt = `
Based on this career data: ${JSON.stringify(roleData, null, 2)}

Generate a comprehensive career path analysis for "${role}" in the following JSON format:

{
  "role": "${role}",
  "career_path": {
    "entry_level": {
      "title": "Junior/Entry Level Title",
      "duration": "X-Y years",
      "salary_range": "X-Y LPA",
      "required_skills": ["skill1", "skill2", "skill3"],
      "required_education": "Minimum education requirement",
      "responsibilities": ["responsibility1", "responsibility2"]
    },
    "mid_level": {
      "title": "Mid Level Title",
      "duration": "X-Y years",
      "salary_range": "X-Y LPA",
      "required_skills": ["skill1", "skill2", "skill3"],
      "additional_certifications": ["cert1", "cert2"],
      "responsibilities": ["responsibility1", "responsibility2"]
    },
    "senior_level": {
      "title": "Senior Level Title",
      "duration": "X+ years",
      "salary_range": "X-Y LPA",
      "required_skills": ["skill1", "skill2", "skill3"],
      "leadership_skills": ["leadership1", "leadership2"],
      "responsibilities": ["responsibility1", "responsibility2"]
    }
  },
  "growth_opportunities": {
    "salary_growth": "X% over Y years",
    "promotion_timeline": "Typical promotion every X-Y years",
    "industry_sectors": ["sector1", "sector2", "sector3"],
    "entrepreneurship": "Brief description of business opportunities",
    "government_exams": ["exam1", "exam2"] or null,
    "further_studies": ["Master's options", "PhD options", "Professional certifications"]
  },
  "market_insights": {
    "demand": "High/Medium/Low",
    "future_outlook": "Brief outlook for next 5 years",
    "emerging_trends": ["trend1", "trend2"],
    "location_preferences": ["city1", "city2", "remote work potential"]
  },
  "success_tips": ["tip1", "tip2", "tip3"]
}

Provide realistic Indian market data and ensure all salary figures are in LPA (Lakhs Per Annum).
`;

    console.log('🤖 Generating career path for:', role);
    
    // Query OpenRouter AI
    let aiResponse = await queryOpenRouter(prompt);
    
    // Parse AI response (clean up markdown formatting if present)
    if (aiResponse.includes('```json')) {
      aiResponse = aiResponse.replace(/```json\s*/g, '').replace(/\s*```/g, '').trim();
    }
    if (aiResponse.includes('```')) {
      aiResponse = aiResponse.replace(/```\s*/g, '').replace(/\s*```/g, '').trim();
    }

    console.log('🧹 Cleaned AI response length:', aiResponse.length);
    console.log('🧹 Cleaned AI response preview:', aiResponse.substring(0, 300) + '...');

    try {
      const careerPath = JSON.parse(aiResponse);
      
      console.log('✅ Career path generated successfully');
      
      res.json({
        success: true,
        data: careerPath,
        source_data: roleData,
        generated_at: new Date().toISOString()
      });
      
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      
      // Fallback response if AI doesn't return valid JSON
      const fallbackResponse = {
        role: role,
        career_path: {
          entry_level: {
            title: `Junior ${role}`,
            duration: roleData.Promotion_Time_Years,
            salary_range: roleData.Entry_Salary_LPA + ' LPA',
            required_skills: ['Technical skills', 'Communication', 'Problem solving'],
            required_education: 'Bachelor\'s degree in relevant field',
            responsibilities: ['Learning and development', 'Supporting senior team members']
          },
          senior_level: {
            title: `Senior ${role}`,
            duration: '5+ years',
            salary_range: roleData.Senior_Salary_LPA + ' LPA',
            required_skills: ['Advanced technical skills', 'Leadership', 'Strategic thinking'],
            leadership_skills: ['Team management', 'Project leadership'],
            responsibilities: ['Leading projects', 'Mentoring juniors', 'Strategic planning']
          }
        },
        growth_opportunities: {
          salary_growth: roleData.Salary_Gain_Percent + '%',
          promotion_timeline: `Typical promotion every ${roleData.Promotion_Time_Years} years`,
          industry_sectors: ['Technology', 'Finance', 'Healthcare'],
          further_studies: ['Master\'s degree', 'Professional certifications']
        },
        market_insights: {
          demand: 'Medium to High',
          future_outlook: 'Positive growth expected',
          emerging_trends: ['Digital transformation', 'Remote work']
        },
        success_tips: ['Continuous learning', 'Networking', 'Stay updated with industry trends'],
        ai_response_raw: aiResponse
      };
      
      res.json({
        success: true,
        data: fallbackResponse,
        source_data: roleData,
        generated_at: new Date().toISOString(),
        note: 'Fallback response used due to AI parsing error'
      });
    }

  } catch (error) {
    console.error('Career Path Generation Error:', error);
    
    // Provide fallback response even when API fails
    const fallbackResponse = {
      role: role,
      career_path: {
        entry_level: {
          title: `Junior ${role}`,
          duration: roleData ? roleData.Promotion_Time_Years : '2-4 years',
          salary_range: roleData ? roleData.Entry_Salary_LPA + ' LPA' : '3-6 LPA',
          required_skills: ['Technical skills', 'Communication', 'Problem solving'],
          required_education: 'Bachelor\'s degree in relevant field',
          responsibilities: ['Learning and development', 'Supporting senior team members']
        },
        senior_level: {
          title: `Senior ${role}`,
          duration: '5+ years',
          salary_range: roleData ? roleData.Senior_Salary_LPA + ' LPA' : '10-20 LPA',
          required_skills: ['Advanced technical skills', 'Leadership', 'Strategic thinking'],
          leadership_skills: ['Team management', 'Project leadership'],
          responsibilities: ['Leading projects', 'Mentoring juniors', 'Strategic planning']
        }
      },
      growth_opportunities: {
        salary_growth: roleData ? roleData.Salary_Gain_Percent + '%' : '100-300%',
        promotion_timeline: `Typical promotion every ${roleData ? roleData.Promotion_Time_Years : '3-5'} years`,
        industry_sectors: ['Technology', 'Finance', 'Healthcare'],
        entrepreneurship: 'Freelancing and consulting opportunities available',
        further_studies: ['Master\'s degree', 'Professional certifications', 'Specialized courses']
      },
      market_insights: {
        demand: 'Medium to High',
        future_outlook: 'Positive growth expected in the digital age',
        emerging_trends: ['Digital transformation', 'Remote work', 'AI integration'],
        location_preferences: ['Major cities', 'Remote work friendly']
      },
      success_tips: [
        'Focus on continuous learning and skill development',
        'Build a strong professional network',
        'Stay updated with industry trends and technologies',
        'Develop both technical and soft skills',
        'Consider specialization in high-demand areas'
      ],
      note: 'AI service temporarily unavailable - showing data-based career insights'
    };
    
    res.json({
      success: true,
      data: fallbackResponse,
      source_data: roleData,
      generated_at: new Date().toISOString(),
      note: 'Fallback response - AI service temporarily unavailable'
    });
  }
});

// Get all available roles
router.get('/roles', (req, res) => {
  try {
    const roles = careerData.map(item => ({
      role: item.Role,
      entry_salary: item.Entry_Salary_LPA,
      senior_salary: item.Senior_Salary_LPA,
      promotion_time: item.Promotion_Time_Years,
      growth_percent: item.Salary_Gain_Percent
    }));

    res.json({
      success: true,
      data: roles,
      total: roles.length
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({
      error: 'Failed to fetch roles',
      message: error.message
    });
  }
});

// Get career comparison between two roles
router.post('/compare', async (req, res) => {
  try {
    const { role1, role2 } = req.body;

    if (!role1 || !role2) {
      return res.status(400).json({ error: 'Both roles are required for comparison' });
    }

    const roleData1 = careerData.find(item => 
      item.Role.toLowerCase().includes(role1.toLowerCase())
    );
    const roleData2 = careerData.find(item => 
      item.Role.toLowerCase().includes(role2.toLowerCase())
    );

    if (!roleData1 || !roleData2) {
      return res.status(404).json({ error: 'One or both roles not found in database' });
    }

    const prompt = `
Compare these two career roles and provide a detailed analysis:

Role 1: ${JSON.stringify(roleData1, null, 2)}
Role 2: ${JSON.stringify(roleData2, null, 2)}

Provide comparison in this JSON format:
{
  "comparison": {
    "salary_comparison": "Which has better salary progression and by how much",
    "promotion_speed": "Which offers faster promotions",
    "growth_potential": "Which has better long-term growth",
    "entry_barriers": "Which is easier to enter",
    "market_demand": "Which has better market demand"
  },
  "recommendation": "Overall recommendation with reasoning"
}
`;

    const aiResponse = await queryOpenRouter(prompt);
    
    let comparison;
    try {
      comparison = JSON.parse(aiResponse.replace(/```json\n?/g, '').replace(/\n?```/g, ''));
    } catch (parseError) {
      comparison = {
        comparison: {
          salary_comparison: `${roleData1.Role}: ${roleData1.Entry_Salary_LPA} to ${roleData1.Senior_Salary_LPA} LPA vs ${roleData2.Role}: ${roleData2.Entry_Salary_LPA} to ${roleData2.Senior_Salary_LPA} LPA`,
          promotion_speed: `${roleData1.Role}: ${roleData1.Promotion_Time_Years} years vs ${roleData2.Role}: ${roleData2.Promotion_Time_Years} years`,
          growth_potential: `${roleData1.Role}: ${roleData1.Salary_Gain_Percent}% vs ${roleData2.Role}: ${roleData2.Salary_Gain_Percent}%`
        },
        recommendation: 'Both roles have their unique advantages. Consider your interests and career goals.'
      };
    }

    res.json({
      success: true,
      data: {
        role1: roleData1,
        role2: roleData2,
        analysis: comparison
      }
    });

  } catch (error) {
    console.error('Career Comparison Error:', error);
    res.status(500).json({
      error: 'Failed to compare careers',
      message: error.message
    });
  }
});

// Get career advice for any question using AI
router.post('/ask', async (req, res) => {
  try {
    const { question, userProfile, language = 'en' } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    console.log('🤖 Answering career question:', question);
    console.log('🌐 User language:', language);

    // Language-specific instructions
    const languageInstructions = {
      'en': 'Respond in clear, professional English.',
      'hi': 'कृपया अपना उत्तर हिंदी में दें। व्यावसायिक और स्पष्ट भाषा का उपयोग करें।',
      'ur': 'براہ کرم اپنا جواب اردو میں دیں۔ پیشہ ورانہ اور واضح زبان استعمال کریں۔',
      'ks': 'مہربانی کرتؠ پننہٕ جواب کٲشُر زبانؠ مؠ دیو۔ پیشہ ورانہ تؠ واضح زبان استعمال کریو۔',
      'dg': 'कृपया अपणा जवाब डोगरी भाषा मी दिया करो। पेशेवर ते साफ भाषा दा इस्तेमाल करो।'
    };

    // Create a comprehensive prompt for AI
    const prompt = `
You are an expert career advisor. Answer this career-related question with detailed, practical advice.

Question: "${question}"

Language Instructions: ${languageInstructions[language] || languageInstructions['en']}

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

    console.log('🤖 Calling AI for general question in language:', language);
    
    // Query OpenRouter AI
    const aiResponse = await queryOpenRouter(prompt);
    
    console.log('✅ AI response received for question');
    
    res.json({
      success: true,
      data: {
        question: question,
        answer: aiResponse,
        language: language,
        generated_at: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Career Question Error:', error);
    
    // Provide a fallback response for common questions
    const fallbackResponse = generateFallbackResponse(req.body.question, req.body.language);
    
    res.json({
      success: true,
      data: {
        question: req.body.question,
        answer: fallbackResponse,
        language: req.body.language || 'en',
        generated_at: new Date().toISOString(),
        note: 'AI service temporarily unavailable - providing data-based response'
      }
    });
  }
});

// Fallback response generator for common questions
function generateFallbackResponse(question, language = 'en') {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('skills') && lowerQuestion.includes('pay')) {
    return `# Highest Paying Skills in 2025

Based on current market data, here are the skills commanding the highest salaries:

## 💰 Tech Skills (Highest ROI):
• **Cloud Computing** (AWS, Azure): ₹8-25 LPA
• **Data Science & AI**: ₹6-20 LPA  
• **Cybersecurity**: ₹7-18 LPA
• **DevOps Engineering**: ₹8-22 LPA
• **Full-Stack Development**: ₹5-15 LPA

## 🎯 Specialized Skills:
• **Product Management**: ₹10-30 LPA
• **Digital Marketing (Advanced)**: ₹4-12 LPA
• **UI/UX Design**: ₹5-15 LPA
• **Blockchain Development**: ₹8-25 LPA

## 📈 Growth Tip:
Combine technical skills with business understanding. For example, a developer who understands product strategy can earn 40-60% more than peers.

The key is continuous learning and specialization in high-demand areas!`;
  }
  
  if (lowerQuestion.includes('career') && (lowerQuestion.includes('change') || lowerQuestion.includes('switch'))) {
    return `# Career Change Strategy

Making a career change can be challenging but rewarding. Here's a strategic approach:

## 🎯 Assessment Phase (1-2 months):
• Identify your transferable skills
• Research target industry salary ranges
• Network with professionals in your target field
• Take online courses to fill skill gaps

## 💼 Transition Strategies:
• **Internal Move**: Look for opportunities within current company
• **Gradual Transition**: Take on projects in your target area
• **Skill-First Approach**: Build expertise before making the switch
• **Network-Driven**: Leverage connections for opportunities

## 💰 Financial Planning:
• Expect 10-30% salary adjustment initially
• Budget for training/certification costs (₹50k-2L typically)
• Plan for 3-6 months transition period

## 🚀 Success Tips:
The best time to change careers is when you have 2-3 years of experience and clear direction about your next move.`;
  }
  
  return `I understand you're looking for career guidance. While I'm having trouble accessing the full AI system right now, I can still help with:

• Career path planning and role analysis
• Salary expectations and market insights  
• Education vs skills decisions
• Industry trends and opportunities

Could you rephrase your question or ask about a specific career topic? I'm here to provide detailed, helpful advice!`;
}

module.exports = router;