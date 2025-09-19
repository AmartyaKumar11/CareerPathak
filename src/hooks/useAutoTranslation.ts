import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Simple translation cache to avoid repeated API calls
const translationCache = new Map<string, Map<string, string>>();

// Auto-translation service using Google Translate API (or similar)
const autoTranslate = async (text: string, targetLang: string): Promise<string> => {
  // Check cache first
  if (translationCache.has(text) && translationCache.get(text)!.has(targetLang)) {
    return translationCache.get(text)!.get(targetLang)!;
  }

  try {
    // You can replace this with any translation service
    // For now, using a simple mapping for demo
    const translations: Record<string, Record<string, string>> = {
      'en': {
        'CareerPathak': 'CareerPathak',
        'Your Career Journey': 'Your Career Journey',
        'Settings': 'Settings',
        'Sign Out': 'Sign Out',
        'Welcome back': 'Welcome back'
      },
      'hi': {
        'CareerPathak': 'करियर पाठक',
        'Your Career Journey': 'आपकी करियर यात्रा',
        'Settings': 'सेटिंग्स',
        'Sign Out': 'साइन आउट',
        'Welcome back': 'वापस आपका स्वागत है'
      },
      'ur': {
        'CareerPathak': 'کیریئر پاتھک',
        'Your Career Journey': 'آپ کا کیریئر سفر',
        'Settings': 'سیٹنگز',
        'Sign Out': 'سائن آؤٹ',
        'Welcome back': 'واپس آپ کا خیر مقدم'
      },
      'ks': {
        'CareerPathak': 'کیرئیر پاتھک',
        'Your Career Journey': 'توہیک کیرئیر سفر',
        'Settings': 'سیٹنگز',
        'Sign Out': 'سائن آؤٹ',
        'Welcome back': 'واپس آو'
      },
      'dg': {
        'CareerPathak': 'करियर पाठक',
        'Your Career Journey': 'तुंदा करियर सफर',
        'Settings': 'सेटिंग',
        'Sign Out': 'साइन आउट',
        'Welcome back': 'वापस आओ'
      }
    };

    const translated = translations[targetLang]?.[text] || text;
    
    // Cache the result
    if (!translationCache.has(text)) {
      translationCache.set(text, new Map());
    }
    translationCache.get(text)!.set(targetLang, translated);
    
    return translated;
  } catch (error) {
    console.warn('Auto-translation failed for:', text);
    return text; // Fallback to original text
  }
};

export const useAutoTranslation = () => {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLang(i18n.language);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, [i18n]);

  const t = async (text: string): Promise<string> => {
    if (currentLang === 'en') {
      return text; // No translation needed for English
    }
    return await autoTranslate(text, currentLang);
  };

  const tSync = (text: string): string => {
    if (currentLang === 'en') {
      return text;
    }
    
    // Try to get from cache first
    const cached = translationCache.get(text)?.get(currentLang);
    if (cached) {
      return cached;
    }
    
    // If not in cache, trigger async translation and return original for now
    autoTranslate(text, currentLang);
    return text;
  };

  return { t, tSync, currentLang };
};