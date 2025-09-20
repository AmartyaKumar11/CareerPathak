require('dotenv').config();

const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function testGeminiAPI() {
  try {
    console.log('🔧 Testing Google Gemini API...');
    console.log('🔑 API Key present:', !!GOOGLE_GEMINI_API_KEY);
    console.log('🔗 URL:', GEMINI_BASE_URL);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: "Hello! Please respond with a brief career advice for students in Jammu & Kashmir."
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 512
      }
    };

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
      console.log(`✅ Success! Response length: ${aiResponse.length}`);
      console.log('📝 AI Response:');
      console.log(aiResponse);
      console.log('\n🎉 Google Gemini API is working correctly!');
    } else {
      const errorText = await response.text();
      console.log(`❌ Error: ${response.status} - ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testGeminiAPI();