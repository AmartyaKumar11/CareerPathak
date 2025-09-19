import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { autoTranslateService } from '@/services/autoTranslateService';

interface AutoTranslateProps {
  children: string;
  fallback?: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const AutoTranslate: React.FC<AutoTranslateProps> = ({ 
  children, 
  fallback, 
  className, 
  as: Component = 'span' 
}) => {
  const { i18n } = useTranslation();
  const [translatedText, setTranslatedText] = useState(children);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const translateText = async () => {
      console.log(`🌐 AutoTranslate: Translating "${children}" for language "${i18n.language}"`);
      
      if (i18n.language === 'en') {
        console.log('🇺🇸 Language is English, no translation needed');
        setTranslatedText(children);
        return;
      }

      setIsLoading(true);
      try {
        console.log(`🔄 Starting translation for: "${children}"`);
        const translated = await autoTranslateService.translateText(children, i18n.language);
        console.log(`✅ Translation completed: "${translated}"`);
        setTranslatedText(translated);
      } catch (error) {
        console.error('❌ Auto-translation failed:', error);
        setTranslatedText(fallback || children); // Fallback to original
      } finally {
        setIsLoading(false);
      }
    };

    translateText();
    
    const handleLanguageChange = () => {
      console.log(`🔄 Language changed to: ${i18n.language}`);
      translateText();
    };
    i18n.on('languageChanged', handleLanguageChange);
    
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, [children, fallback, i18n]);

  if (isLoading) {
    return <Component className={`${className} opacity-75 transition-opacity`}>{children}</Component>;
  }

  return <Component className={className}>{translatedText}</Component>;
};

// Utility hook for programmatic translation
export const useAutoTranslate = () => {
  const { i18n } = useTranslation();
  
  const translate = async (text: string): Promise<string> => {
    if (i18n.language === 'en') return text;
    return await autoTranslateService.translateText(text, i18n.language);
  };

  return { translate, currentLanguage: i18n.language };
};