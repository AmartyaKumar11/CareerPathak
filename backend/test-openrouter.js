require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function testOpenRouter() {
  console.log('🔑 API Key present:', !!OPENROUTER_API_KEY);
  console.log('🔑 API Key prefix:', OPENROUTER_API_KEY?.substring(0, 20));
  console.log('🔗 URL:', OPENROUTER_BASE_URL);
  
  // Test with the simplest free models first
  const modelsToTry = [
    'meta-llama/llama-3.2-3b-instruct:free',
    'meta-llama/llama-3.2-1b-instruct:free',
    'huggingface/starcoder:free',
    'nousresearch/nous-capybara-7b:free',
    'mistralai/mistral-7b-instruct:free'
  ];
  
  for (const model of modelsToTry) {
    console.log(`\n🧪 Trying model: ${model}`);
    
    try {
      const requestBody = {
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. Always provide clear, direct responses.'
          },
          {
            role: 'user',
            content: 'Say "Hello! The AI is working correctly." and then provide one career tip.'
          }
        ],
        temperature: 0.1,
        max_tokens: 50
      };

      const response = await fetch(OPENROUTER_BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'CareerPathak Test'
        },
        body: JSON.stringify(requestBody)
      });

      console.log(`📥 Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS with ${model}!`);
        console.log(`Response: ${data.choices[0].message.content}`);
        return model; // Return the working model
      } else {
        const errorText = await response.text();
        console.log(`❌ Failed: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n❌ All models failed');
  return null;
}

testOpenRouter().then(workingModel => {
  if (workingModel) {
    console.log(`\n🎉 Use this model in your app: ${workingModel}`);
  } else {
    console.log('\n😞 No working models found. Check your API key or try different models.');
  }
});