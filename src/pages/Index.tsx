import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  GraduationCap, 
  Users, 
  Building, 
  TrendingUp, 
  Calculator,
  Globe,
  ChevronDown,
  MapPin,
  Star,
  Trophy,
  Heart,
  Briefcase
} from 'lucide-react';

// Import the hero image
import heroImage from '@/assets/hero-image.jpg';

// Import alumni data
import alumniData from '@/data/alumni.json';

const Index = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  // Handler for Authenticate button
  const handleAuthenticate = () => {
    navigate('/auth');
  };
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [studentsCount, setStudentsCount] = useState(0);
  const [collegesCount, setCollegesCount] = useState(0);
  const [careersCount, setCareersCount] = useState(0);
  const [currentAlumni, setCurrentAlumni] = useState(0);
  
  // Government advantage calculator state
  const [income, setIncome] = useState([300000]);
  const [studyDuration, setStudyDuration] = useState([4]);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Animate counters on mount
  useEffect(() => {
    const animateCounter = (setter: (value: number) => void, target: number, duration: number = 2000) => {
      let start = 0;
      const increment = target / (duration / 50);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(start));
        }
      }, 50);
    };

    animateCounter(setStudentsCount, 15420);
    animateCounter(setCollegesCount, 150);
    animateCounter(setCareersCount, 200);
  }, []);

  // Alumni carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAlumni((prev) => (prev + 1) % alumniData.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
  };

  const handleGetStarted = () => {
    console.log('handleGetStarted called');
    console.log('Current user:', user);
    if (user) {
      console.log('User authenticated, navigating to /dashboard');
      navigate('/dashboard');
    } else {
      console.log('No user, navigating to /auth');
      navigate('/auth');
    }
  };

  const calculateSavings = () => {
    const privateFees = 400000; // Average private college fees
    const governmentFees = 50000; // Average government college fees
    const totalSavings = (privateFees - governmentFees) * studyDuration[0];
    return totalSavings.toLocaleString('en-IN');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Language Selector */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">CareerPathak</span>
          </div>
          <div className="flex items-center gap-4">
            <Select value={currentLanguage} onValueChange={changeLanguage}>
              <SelectTrigger className="w-40">
                <Globe className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t('languages.english')}</SelectItem>
                <SelectItem value="hi">{t('languages.hindi')}</SelectItem>
                <SelectItem value="ur">{t('languages.urdu')}</SelectItem>
                <SelectItem value="ks">{t('languages.kashmiri')}</SelectItem>
                <SelectItem value="dg">{t('languages.dogri')}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleAuthenticate} className="ml-2">Authenticate</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-primary/90" />
        
        <div className="relative container mx-auto px-4 py-24 text-center">
          <div>
            <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl">
              {t('hero.title')}
            </h1>
            <p className="mb-8 text-xl opacity-90 md:text-2xl max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4"
                onClick={handleGetStarted}
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                {t('hero.cta_quiz')}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-4"
                onClick={handleGetStarted}
              >
                <Briefcase className="mr-2 h-5 w-5" />
                {t('hero.cta_explore')}
              </Button>
            </div>

            {/* Success Counters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div>
                <div className="text-4xl font-bold mb-2">
                  {studentsCount.toLocaleString()}+
                </div>
                <p className="text-lg opacity-90">{t('hero.success_counter')}</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">
                  {collegesCount}+
                </div>
                <p className="text-lg opacity-90">{t('hero.colleges_counter')}</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">
                  {careersCount}+
                </div>
                <p className="text-lg opacity-90">{t('hero.careers_counter')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Scholarships Card */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 flex flex-col items-center justify-center">
                <Building className="h-12 w-12 text-primary mb-4" />
                <h2 className="text-3xl font-bold mb-4 text-center">Explore Scholarships</h2>
                <p className="text-muted-foreground mb-6 text-center">
                  Discover scholarships tailored for you. Filter by gender, amount, and eligibility to find the best opportunities for your education journey.
                </p>
                <Button size="lg" className="text-lg px-8 py-4" asChild>
                  <Link to="/scholarships">
                    Explore Scholarships
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Alumni Success Carousel */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Success Stories from J&K
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                {alumniData[currentAlumni] && (
                  <div className="grid md:grid-cols-3 gap-6 items-center">
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Users className="h-16 w-16 text-primary" />
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold">
                          {alumniData[currentAlumni].name}
                        </h3>
                        <p className="text-primary font-semibold">
                          {alumniData[currentAlumni].role} • {alumniData[currentAlumni].company}
                        </p>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4" />
                          <span>{alumniData[currentAlumni].hometown} → {alumniData[currentAlumni].location}</span>
                        </div>
                      </div>
                      
                      <blockquote className="text-lg italic text-muted-foreground">
                        "{alumniData[currentAlumni].advice}"
                      </blockquote>
                      
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="gap-1">
                          <Trophy className="h-3 w-3" />
                          {alumniData[currentAlumni].package}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3" />
                          {alumniData[currentAlumni].graduationYear}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-center mt-6 space-x-2">
              {alumniData.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentAlumni ? 'bg-primary' : 'bg-muted'
                  }`}
                  onClick={() => setCurrentAlumni(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of J&K students who have found their perfect career path
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={handleGetStarted}
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              Take Aptitude Quiz
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={handleGetStarted}
            >
              <Building className="mr-2 h-5 w-5" />
              Explore Colleges
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-primary">CareerPathak</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Empowering J&K students with personalized career guidance and opportunities.
              </p>
              <div className="flex space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="text-sm text-muted-foreground">Made with love for J&K</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={handleGetStarted} className="hover:text-primary">Colleges</button></li>
                <li><button onClick={handleGetStarted} className="hover:text-primary">Aptitude Quiz</button></li>
                <li><button onClick={handleGetStarted} className="hover:text-primary">Timeline</button></li>
                <li><button onClick={handleGetStarted} className="hover:text-primary">Resources</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={handleGetStarted} className="hover:text-primary">Help Center</button></li>
                <li><a href="#" className="hover:text-primary">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Languages</h4>
              <div className="flex flex-wrap gap-2">
                {['en', 'hi', 'ur', 'ks', 'dg'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => changeLanguage(lang)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                      currentLanguage === lang 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {t(`languages.${lang === 'en' ? 'english' : lang === 'hi' ? 'hindi' : lang === 'ur' ? 'urdu' : lang === 'ks' ? 'kashmiri' : 'dogri'}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 CareerPathak. All rights reserved. Built for the students of Jammu & Kashmir.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
