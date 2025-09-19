import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AutoTranslate } from '@/components/AutoTranslate';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const TranslationTest = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const changeLanguage = (lng: string) => {
    console.log(`🔄 Changing language to: ${lng}`);
    i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
  };

  const testTexts = [
    "Welcome back",
    "Let's get you started on your career journey!",
    "Loading your dashboard...",
    "CareerPathak",
    "Your Career Journey",
    "Settings",
    "Sign Out"
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Translation Test Page</CardTitle>
          <div className="flex items-center gap-4">
            <span>Current Language: {currentLanguage}</span>
            <Select value={currentLanguage} onValueChange={changeLanguage}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                <SelectItem value="ur">اردو (Urdu)</SelectItem>
                <SelectItem value="ks">کٲشُر (Kashmiri)</SelectItem>
                <SelectItem value="dg">डोगरी (Dogri)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Open the browser console to see translation logs. Switch languages to test automatic translation.
          </div>
          
          {testTexts.map((text, index) => (
            <div key={index} className="border p-4 rounded-lg bg-gray-50">
              <div className="text-sm text-muted-foreground mb-2">Original: "{text}"</div>
              <div className="text-lg font-medium">
                <AutoTranslate>{text}</AutoTranslate>
              </div>
            </div>
          ))}
          
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-6"
          >
            Reload Page
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};