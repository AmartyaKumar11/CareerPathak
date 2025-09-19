import fetch from 'node-fetch';

async function testOpenRouter() {
  const OPENROUTER_API_KEY = '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';
  
  const requestBody = {
    model: 'mistralai/mistral-7b-instruct:free',
    messages: [
      {
        role: 'system',
        content: 'You are a career advisor. Provide career advice in simple JSON format.'
      },
      {
        role: 'user',
        content: 'Tell me about UI/UX Designer career in JSON format with salary and skills.'
      }
    ],
    temperature: 0.3,
    max_tokens: 500
  };

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log('Full Response:', JSON.stringify(data, null, 2));
    
    if (data.choices && data.choices[0]) {
      console.log('\n--- AI Response ---');
      console.log(data.choices[0].message.content);
      console.log('--- End Response ---\n');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testOpenRouter();