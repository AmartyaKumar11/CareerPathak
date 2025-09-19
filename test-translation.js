// Test script to check google-translate-api
const translate = require('google-translate-api');

async function testTranslation() {
  try {
    console.log('Testing google-translate-api...');
    
    const result = await translate('Welcome back', { from: 'en', to: 'hi' });
    console.log('✅ Translation successful!');
    console.log('Original:', 'Welcome back');
    console.log('Translated to Hindi:', result.text);
    
    const result2 = await translate('Let\'s get you started on your career journey!', { from: 'en', to: 'ur' });
    console.log('✅ Urdu translation successful!');
    console.log('Original:', 'Let\'s get you started on your career journey!');
    console.log('Translated to Urdu:', result2.text);
    
  } catch (error) {
    console.error('❌ Translation failed:', error.message);
    console.error('Full error:', error);
  }
}

testTranslation();