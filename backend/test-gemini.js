// Test Google Gemini API
require('dotenv').config();

const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function testGeminiAPI() {
  console.log('🔑 Testing Google Gemini API...');
  console.log('API Key present:', !!GOOGLE_GEMINI_API_KEY);
  console.log('API Key (first 20 chars):', GOOGLE_GEMINI_API_KEY?.substring(0, 20) + '...');

  try {
    const requestBody = {
      contents: [{
        parts: [{
          text: 'Hello! Can you help me with career advice? This is just a test message.'
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 100,
      }
    };

    console.log('📤 Sending request to Gemini API...');
    
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
      const generatedText = data.candidates[0]?.content?.parts[0]?.text;
      
      if (generatedText) {
        console.log('✅ Google Gemini API is working!');
        console.log('Response:', generatedText);
      } else {
        console.log('❌ No text generated in response');
        console.log('Full response:', JSON.stringify(data, null, 2));
      }
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', errorText);
      
      if (response.status === 400) {
        console.log('🚨 This might be due to:');
        console.log('- Invalid request format');
        console.log('- API key restrictions');
        console.log('- Region restrictions');
      } else if (response.status === 403) {
        console.log('🚨 This is likely an API key issue:');
        console.log('- API key might be invalid');
        console.log('- API key might not have Gemini API access');
        console.log('- Billing not set up for the project');
      }
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testGeminiAPI();