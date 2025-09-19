import { useTranslation } from 'react-i18next';

interface TranslationCache {
  [key: string]: { [lang: string]: string };
}

// Simple mock translations for testing
const MOCK_TRANSLATIONS = {
  "Welcome back": {
    hi: "वापस स्वागत है",
    ur: "واپس خوش آمدید",
    ks: "वापस स्वागत है",
    dg: "वापस स्वागत है"
  },
  "Let's get you started on your career journey!": {
    hi: "आइए अपनी करियर यात्रा शुरू करें!",
    ur: "آئیے آپ کے کیریئر کے سفر کا آغاز کریں!",
    ks: "आइए अपनी करियर यात्रा शुरू करें!",
    dg: "आइए अपनी करियر यात्रा शुरू करें!"
  },
  "Loading your dashboard...": {
    hi: "आपका डैशबोर्ड लोड हो रहा है...",
    ur: "آپ کا ڈیش بورڈ لوڈ ہو رہا ہے...",
    ks: "आपका डैशबोर्ड लोड हो रहा है...",
    dg: "आपका डैशबोर्ड लोड हो रहा है..."
  },
  "CareerPathak": {
    hi: "करियरपाथक",
    ur: "کیریئر پاتھک",
    ks: "करियरपाथक",
    dg: "करियरपाथक"
  },
  "Your Career Journey": {
    hi: "आपकी करियर यात्रा",
    ur: "آپ کا کیریئر سفر",
    ks: "आपकी करियर यात्रा",
    dg: "आपकी करियर यात्रा"
  },
  "Settings": {
    hi: "सेटिंग्स",
    ur: "ترتیبات",
    ks: "सेटिंग्स",
    dg: "सेटिंग्स"
  },
  "Sign Out": {
    hi: "साइन आउट",
    ur: "سائن آؤٹ",
    ks: "साइन आउट",
    dg: "साइन आउट"
  }
};

class AutoTranslateService {
  private cache: TranslationCache = {};
  private useMockTranslations = true; // Toggle for testing

  // Main translation method
  async translateText(text: string, targetLang: string): Promise<string> {
    console.log(`🌐 AutoTranslateService: Translating "${text}" to "${targetLang}"`);
    
    // Check cache first
    if (this.cache[text] && this.cache[text][targetLang]) {
      console.log(`📦 Cache hit for "${text}" -> "${this.cache[text][targetLang]}"`);
      return this.cache[text][targetLang];
    }

    // Return original text if English
    if (targetLang === 'en') {
      console.log(`🇺🇸 English detected, returning original text`);
      return text;
    }

    try {
      let translatedText: string;

      if (this.useMockTranslations && MOCK_TRANSLATIONS[text] && MOCK_TRANSLATIONS[text][targetLang]) {
        // Use mock translations for testing
        translatedText = MOCK_TRANSLATIONS[text][targetLang];
        console.log(`🎭 Using mock translation: "${text}" -> "${translatedText}"`);
      } else {
        // Try to use real google-translate-api
        console.log(`🔄 Attempting real translation...`);
        const mappedLang = this.mapLanguageCode(targetLang);
        
        try {
          const module = await import('google-translate-api');
          const translate = module.default || module;
          const result = await translate(text, { from: 'en', to: mappedLang });
          translatedText = result.text;
          console.log(`✅ Google Translate API success: "${translatedText}"`);
        } catch (googleError) {
          console.warn(`⚠️ Google Translate API failed, using fallback:`, googleError.message);
          // Fallback to mock or original text
          translatedText = MOCK_TRANSLATIONS[text]?.[targetLang] || text;
        }
      }

      // Cache the result
      if (!this.cache[text]) this.cache[text] = {};
      this.cache[text][targetLang] = translatedText;

      console.log(`✅ Final translation: "${text}" -> "${translatedText}"`);
      return translatedText;
    } catch (error) {
      console.error('❌ Translation error:', error);
      return text; // Fallback to original text
    }
  }

  // Map your language codes to Google's format
  private mapLanguageCode(lang: string): string {
    const mapping: { [key: string]: string } = {
      'en': 'en',
      'hi': 'hi',
      'ur': 'ur',
      'ks': 'hi', // Kashmiri fallback to Hindi (not directly supported)
      'dg': 'hi'  // Dogri fallback to Hindi (not directly supported)
    };
    return mapping[lang] || 'en';
  }

  // Toggle between mock and real translations
  setUseMockTranslations(useMock: boolean) {
    this.useMockTranslations = useMock;
    console.log(`🔧 Translation mode: ${useMock ? 'Mock' : 'Real Google API'}`);
  }

  // Batch translate multiple texts
  async translateBatch(texts: string[], targetLang: string): Promise<string[]> {
    return Promise.all(texts.map(text => this.translateText(text, targetLang)));
  }

  // Clear cache if needed
  clearCache() {
    this.cache = {};
    console.log('🗑️ Translation cache cleared');
  }
}

export const autoTranslateService = new AutoTranslateService();

// React Hook for automatic translation
export const useAutoTranslate = () => {
  const { i18n } = useTranslation();
  
  const translateText = async (text: string): Promise<string> => {
    if (i18n.language === 'en') return text;
    return await autoTranslateService.translateText(text, i18n.language);
  };

  return { translate: translateText, currentLanguage: i18n.language };
};