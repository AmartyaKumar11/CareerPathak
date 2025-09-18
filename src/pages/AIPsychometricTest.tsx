import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Brain, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Lightbulb,
  Target,
  BarChart3,
  Users,
  Zap,
  Heart,
  Search,
  Briefcase
} from 'lucide-react';

import { 
  aiPsychometricService, 
  PsychometricQuestion, 
  UserResponse, 
  PersonalityProfile 
} from '@/services/aiPsychometricService';

interface AcademicPerformance {
  Mathematics: number;
  Physics: number;
  Chemistry: number;
  Biology: number;
  English: number;
  Economics: number;
  'Computer Science': number;
  History: number;
  Geography: number;
}

const AIPsychometricTest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Test state
  const [currentStep, setCurrentStep] = useState<'intro' | 'academic' | 'questions' | 'results'>('intro');
  const [questions, setQuestions] = useState<PsychometricQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [academicPerformance, setAcademicPerformance] = useState<AcademicPerformance>({
    Mathematics: 75,
    Physics: 70,
    Chemistry: 65,
    Biology: 60,
    English: 80,
    Economics: 70,
    'Computer Science': 85,
    History: 65,
    Geography: 60
  });
  
  // Question state
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [confidenceLevel, setConfidenceLevel] = useState<number[]>([3]);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  
  // Results state
  const [personalityProfile, setPersonalityProfile] = useState<PersonalityProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  // Check for existing results and redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Check for existing test results
    checkExistingResults();
  }, [user, navigate]);

  const checkExistingResults = async () => {
    setCheckingExisting(true);
    try {
      const existingProfile = await aiPsychometricService.getUserProfile(user?.email || '');
      if (existingProfile) {
        setPersonalityProfile(existingProfile);
        setCurrentStep('results');
      }
    } catch (error) {
      // No existing results found, continue with normal flow
      console.log('No existing results found');
    } finally {
      setCheckingExisting(false);
    }
  };

  const handleStartTest = async () => {
    setCurrentStep('academic');
  };

  const handleAcademicSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Generate adaptive questions based on academic performance
      const generatedQuestions = await aiPsychometricService.generateAdaptiveQuestions(
        user?.email || 'anonymous',
        academicPerformance,
        [],
        15 // Generate 15 questions
      );
      
      setQuestions(generatedQuestions);
      setCurrentStep('questions');
      setQuestionStartTime(Date.now());
    } catch (err) {
      setError('Failed to generate questions. Please try again.');
      console.error('Error generating questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) return;

    const responseTime = (Date.now() - questionStartTime) / 1000; // Convert to seconds
    
    const newResponse: UserResponse = {
      question_id: questions[currentQuestionIndex].id,
      response: selectedAnswer,
      response_time: responseTime,
      confidence_level: confidenceLevel[0]
    };

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
      setConfidenceLevel([3]);
      setQuestionStartTime(Date.now());
    } else {
      // Test completed, analyze results
      handleTestComplete(updatedResponses);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Restore previous answer
      const previousResponse = responses[currentQuestionIndex - 1];
      if (previousResponse) {
        setSelectedAnswer(previousResponse.response);
        setConfidenceLevel([previousResponse.confidence_level || 3]);
      }
    }
  };

  const handleTestComplete = async (finalResponses: UserResponse[]) => {
    setLoading(true);
    setError(null);

    try {
      const result = await aiPsychometricService.submitAssessment(
        user?.email || 'anonymous',
        finalResponses,
        academicPerformance
      );

      setPersonalityProfile(result.profile);
      setCurrentStep('results');
      
      // Store completion in localStorage
      localStorage.setItem('careerpathak_quiz_completed', 'true');
    } catch (err) {
      setError('Failed to analyze responses. Please try again.');
      console.error('Error analyzing responses:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTraitIcon = (trait: string) => {
    const icons: Record<string, React.ElementType> = {
      analytical_thinking: BarChart3,
      creativity: Lightbulb,
      leadership: Users,
      social_skills: Heart,
      technical_aptitude: Zap,
      entrepreneurial_spirit: Briefcase,
      research_orientation: Search,
      helping_others: Heart
    };
    return icons[trait] || Target;
  };

  const getTraitColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-blue-600 bg-blue-100';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const handleQuickDemo = async (profile: 'leadership' | 'technical' | 'creative') => {
    setLoading(true);
    setError(null);
    
    try {
      // Set academic performance based on profile
      let demoAcademicPerformance: AcademicPerformance;
      
      switch (profile) {
        case 'leadership':
          demoAcademicPerformance = {
            Mathematics: 75,
            Physics: 70,
            Chemistry: 65,
            Biology: 60,
            English: 90,
            Economics: 85,
            'Computer Science': 70,
            History: 80,
            Geography: 75
          };
          break;
        case 'technical':
          demoAcademicPerformance = {
            Mathematics: 95,
            Physics: 90,
            Chemistry: 85,
            Biology: 70,
            English: 75,
            Economics: 70,
            'Computer Science': 95,
            History: 65,
            Geography: 60
          };
          break;
        case 'creative':
          demoAcademicPerformance = {
            Mathematics: 70,
            Physics: 65,
            Chemistry: 60,
            Biology: 75,
            English: 90,
            Economics: 75,
            'Computer Science': 80,
            History: 85,
            Geography: 80
          };
          break;
      }
      
      setAcademicPerformance(demoAcademicPerformance);
      
      try {
        // Try to generate questions from backend
        const generatedQuestions = await Promise.race([
          aiPsychometricService.generateAdaptiveQuestions(
            user?.email || 'demo_user',
            demoAcademicPerformance,
            [],
            8 // Fewer questions for demo
          ),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000) // 5 second timeout
          )
        ]) as PsychometricQuestion[];
        
        setQuestions(generatedQuestions);
        await handleAutoFillWithQuestions(generatedQuestions, profile, demoAcademicPerformance);
        
      } catch (backendError) {
        console.log('Backend unavailable, using offline demo mode');
        
        // Use offline demo mode with pre-generated profile
        const offlineProfile = generateOfflineDemoProfile(profile, demoAcademicPerformance);
        setPersonalityProfile(offlineProfile);
        setCurrentStep('results');
      }
      
    } catch (error) {
      setError('Failed to run quick demo. Please try again.');
      console.error('Quick demo error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetakeTest = () => {
    // Reset all state to start fresh
    setCurrentStep('intro');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setResponses([]);
    setSelectedAnswer('');
    setConfidenceLevel([3]);
    setPersonalityProfile(null);
    setError(null);
    
    // Reset academic performance to defaults
    setAcademicPerformance({
      Mathematics: 75,
      Physics: 70,
      Chemistry: 65,
      Biology: 60,
      English: 80,
      Economics: 70,
      'Computer Science': 85,
      History: 65,
      Geography: 60
    });
  };

  const generateOfflineDemoProfile = (
    profile: 'leadership' | 'technical' | 'creative',
    academicPerf: AcademicPerformance
  ): PersonalityProfile => {
    let traitScores: Record<string, number>;
    let learningStyle: string;
    let interests: string[];
    let strengths: string[];
    let recommendedStreams: any[];

    switch (profile) {
      case 'leadership':
        traitScores = {
          analytical_thinking: 0.75,
          creativity: 0.70,
          leadership: 0.90,
          social_skills: 0.85,
          technical_aptitude: 0.60,
          entrepreneurial_spirit: 0.80,
          research_orientation: 0.65,
          helping_others: 0.85
        };
        learningStyle = 'Collaborative Learning';
        interests = ['Team Management', 'Public Speaking', 'Strategic Planning', 'Communication'];
        strengths = ['Leadership', 'Social Skills', 'Communication', 'Team Building'];
        recommendedStreams = [
          {
            stream: 'Business Administration',
            description: 'Focus on management, finance, and business operations',
            match_percentage: 92,
            trait_match: 0.90,
            academic_match: 0.85,
            career_paths: ['Business Manager', 'Team Leader', 'Consultant', 'Entrepreneur'],
            salary_range: '₹5-20 LPA',
            growth_prospects: 'Excellent',
            required_subjects: ['Economics', 'Business Studies', 'Mathematics']
          },
          {
            stream: 'Liberal Arts & Humanities',
            description: 'Focus on literature, social sciences, and human culture',
            match_percentage: 78,
            trait_match: 0.75,
            academic_match: 0.80,
            career_paths: ['HR Manager', 'Social Worker', 'Teacher', 'Content Creator'],
            salary_range: '₹3-15 LPA',
            growth_prospects: 'Good',
            required_subjects: ['English', 'History', 'Political Science']
          }
        ];
        break;

      case 'technical':
        traitScores = {
          analytical_thinking: 0.95,
          creativity: 0.75,
          leadership: 0.60,
          social_skills: 0.55,
          technical_aptitude: 0.95,
          entrepreneurial_spirit: 0.70,
          research_orientation: 0.85,
          helping_others: 0.60
        };
        learningStyle = 'Logical/Mathematical';
        interests = ['Programming', 'Problem Solving', 'Technology', 'Innovation'];
        strengths = ['Technical Aptitude', 'Analytical Thinking', 'Problem Solving', 'Research'];
        recommendedStreams = [
          {
            stream: 'Computer Science & Engineering',
            description: 'Focus on software development, algorithms, and computer systems',
            match_percentage: 96,
            trait_match: 0.95,
            academic_match: 0.92,
            career_paths: ['Software Engineer', 'Data Scientist', 'AI Researcher', 'Tech Lead'],
            salary_range: '₹6-25 LPA',
            growth_prospects: 'Excellent',
            required_subjects: ['Mathematics', 'Physics', 'Computer Science']
          },
          {
            stream: 'Pure Sciences',
            description: 'Focus on fundamental scientific research and discovery',
            match_percentage: 84,
            trait_match: 0.85,
            academic_match: 0.88,
            career_paths: ['Research Scientist', 'Data Analyst', 'R&D Specialist', 'Tech Consultant'],
            salary_range: '₹4-18 LPA',
            growth_prospects: 'Very Good',
            required_subjects: ['Physics', 'Chemistry', 'Mathematics']
          }
        ];
        break;

      case 'creative':
        traitScores = {
          analytical_thinking: 0.70,
          creativity: 0.95,
          leadership: 0.75,
          social_skills: 0.80,
          technical_aptitude: 0.65,
          entrepreneurial_spirit: 0.85,
          research_orientation: 0.70,
          helping_others: 0.75
        };
        learningStyle = 'Visual/Creative';
        interests = ['Design', 'Art', 'Innovation', 'Storytelling'];
        strengths = ['Creativity', 'Innovation', 'Artistic Vision', 'Original Thinking'];
        recommendedStreams = [
          {
            stream: 'Liberal Arts & Humanities',
            description: 'Focus on literature, social sciences, and creative expression',
            match_percentage: 89,
            trait_match: 0.88,
            academic_match: 0.82,
            career_paths: ['Content Creator', 'Designer', 'Writer', 'Artist'],
            salary_range: '₹3-15 LPA',
            growth_prospects: 'Good',
            required_subjects: ['English', 'History', 'Art']
          },
          {
            stream: 'Business Administration',
            description: 'Focus on creative business solutions and entrepreneurship',
            match_percentage: 81,
            trait_match: 0.80,
            academic_match: 0.75,
            career_paths: ['Creative Director', 'Marketing Manager', 'Entrepreneur', 'Brand Manager'],
            salary_range: '₹5-20 LPA',
            growth_prospects: 'Very Good',
            required_subjects: ['Economics', 'Business Studies', 'English']
          }
        ];
        break;
    }

    return {
      user_id: user?.email || 'demo_user',
      trait_scores: traitScores,
      learning_style: learningStyle,
      work_preferences: {
        teamwork: profile === 'leadership' ? 0.9 : 0.6,
        independence: profile === 'technical' ? 0.8 : 0.5,
        leadership: profile === 'leadership' ? 0.9 : 0.6,
        creativity: profile === 'creative' ? 0.9 : 0.6
      },
      interests: interests,
      strengths: strengths,
      areas_for_development: ['Time Management', 'Communication Skills'],
      recommended_streams: recommendedStreams,
      confidence_score: 0.85
    };
  };

  const handleAutoFillWithQuestions = async (
    questionsToFill: PsychometricQuestion[], 
    pattern: 'leadership' | 'technical' | 'creative',
    academicPerf: AcademicPerformance
  ) => {
    const autoResponses: UserResponse[] = [];
    
    questionsToFill.forEach((question, index) => {
      let selectedOptionIndex = 0;
      let confidence = 4;
      let responseTime = 8 + Math.random() * 12;
      
      // Smart option selection based on pattern
      switch (pattern) {
        case 'leadership':
          if (question.traits_measured.includes('leadership') || 
              question.traits_measured.includes('social_skills')) {
            selectedOptionIndex = 0;
            confidence = 5;
          } else {
            selectedOptionIndex = index % question.options.length;
            confidence = 3;
          }
          break;
          
        case 'technical':
          if (question.traits_measured.includes('technical_aptitude') || 
              question.traits_measured.includes('analytical_thinking')) {
            selectedOptionIndex = 0;
            confidence = 5;
          } else {
            selectedOptionIndex = index % question.options.length;
            confidence = 3;
          }
          break;
          
        case 'creative':
          if (question.traits_measured.includes('creativity') || 
              question.traits_measured.includes('entrepreneurial_spirit')) {
            selectedOptionIndex = 0;
            confidence = 5;
          } else {
            selectedOptionIndex = index % question.options.length;
            confidence = 3;
          }
          break;
      }
      
      autoResponses.push({
        question_id: question.id,
        response: question.options[selectedOptionIndex],
        response_time: responseTime,
        confidence_level: confidence
      });
    });
    
    // Submit for analysis
    const result = await aiPsychometricService.submitAssessment(
      user?.email || 'demo_user',
      autoResponses,
      academicPerf
    );
    
    setPersonalityProfile(result.profile);
    setCurrentStep('results');
  };

  const handleAutoFill = async (pattern: 'first' | 'balanced' | 'leadership' | 'technical' | 'creative') => {
    setLoading(true);
    
    try {
      const autoResponses: UserResponse[] = [];
      
      questions.forEach((question, index) => {
        let selectedOptionIndex = 0;
        let confidence = 4;
        let responseTime = 8 + Math.random() * 12; // Random time between 8-20 seconds
        
        switch (pattern) {
          case 'first':
            selectedOptionIndex = 0;
            confidence = 3;
            break;
            
          case 'balanced':
            // Distribute answers across options for balanced profile
            selectedOptionIndex = index % question.options.length;
            confidence = 3 + Math.floor(Math.random() * 2); // 3-4
            break;
            
          case 'leadership':
            // Choose options that indicate leadership traits
            if (question.traits_measured.includes('leadership') || 
                question.traits_measured.includes('social_skills') ||
                question.question.toLowerCase().includes('lead') ||
                question.question.toLowerCase().includes('team')) {
              selectedOptionIndex = 0; // Usually first option for leadership
              confidence = 5;
            } else {
              selectedOptionIndex = Math.floor(Math.random() * question.options.length);
              confidence = 3;
            }
            break;
            
          case 'technical':
            // Choose options that indicate technical aptitude
            if (question.traits_measured.includes('technical_aptitude') || 
                question.traits_measured.includes('analytical_thinking') ||
                question.question.toLowerCase().includes('technical') ||
                question.question.toLowerCase().includes('technology') ||
                question.question.toLowerCase().includes('computer')) {
              selectedOptionIndex = 0; // Usually first option for technical
              confidence = 5;
            } else {
              selectedOptionIndex = Math.floor(Math.random() * question.options.length);
              confidence = 3;
            }
            break;
            
          case 'creative':
            // Choose options that indicate creativity
            if (question.traits_measured.includes('creativity') || 
                question.traits_measured.includes('entrepreneurial_spirit') ||
                question.question.toLowerCase().includes('creative') ||
                question.question.toLowerCase().includes('innovative') ||
                question.question.toLowerCase().includes('design')) {
              selectedOptionIndex = 0; // Usually first option for creativity
              confidence = 5;
            } else {
              selectedOptionIndex = Math.floor(Math.random() * question.options.length);
              confidence = 3;
            }
            break;
        }
        
        autoResponses.push({
          question_id: question.id,
          response: question.options[selectedOptionIndex],
          response_time: responseTime,
          confidence_level: confidence
        });
      });
      
      // Set all responses at once
      setResponses(autoResponses);
      
      // Complete the test immediately
      await handleTestComplete(autoResponses);
      
    } catch (error) {
      setError('Failed to auto-fill responses. Please try again.');
      console.error('Auto-fill error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  // Show loading screen while checking for existing results
  if (checkingExisting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Checking for existing assessment results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-primary">AI Psychometric Assessment</h1>
              <p className="text-xs text-muted-foreground">Discover your ideal career path</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Introduction Step */}
        {currentStep === 'intro' && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Brain className="h-8 w-8 text-primary" />
                  AI-Powered Career Assessment
                </CardTitle>
                <p className="text-muted-foreground">
                  Discover your personality traits and get personalized career recommendations
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">What makes this special?</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        AI-generated adaptive questions
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Personalized based on your academic performance
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Advanced personality trait analysis
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Career recommendations with match percentages
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Assessment Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">15-20 minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Questions:</span>
                        <span className="font-medium">15 adaptive questions</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Traits Measured:</span>
                        <span className="font-medium">8 key traits</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Results:</span>
                        <span className="font-medium">Instant analysis</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    Answer honestly and trust your first instinct. There are no right or wrong answers.
                  </AlertDescription>
                </Alert>

                <div className="text-center space-y-4">
                  <Button onClick={handleStartTest} size="lg" className="px-8">
                    <Brain className="h-4 w-4 mr-2" />
                    Start Assessment
                  </Button>
                  
                  <div className="border-t pt-4">
                    <p className="text-xs text-muted-foreground mb-2">Quick Demo Mode</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => handleQuickDemo('leadership')}
                      >
                        <Users className="h-3 w-3 mr-1" />
                        Demo: Leadership Profile
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => handleQuickDemo('technical')}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Demo: Technical Profile
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => handleQuickDemo('creative')}
                      >
                        <Lightbulb className="h-3 w-3 mr-1" />
                        Demo: Creative Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Academic Performance Step */}
        {currentStep === 'academic' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Academic Performance</CardTitle>
                <p className="text-muted-foreground">
                  Help us understand your academic strengths to personalize your assessment
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(academicPerformance).map(([subject, score]) => (
                    <div key={subject} className="space-y-2">
                      <div className="flex justify-between">
                        <Label>{subject}</Label>
                        <span className="text-sm font-medium">{score}%</span>
                      </div>
                      <Slider
                        value={[score]}
                        onValueChange={(value) => 
                          setAcademicPerformance(prev => ({ ...prev, [subject]: value[0] }))
                        }
                        max={100}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep('intro')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={handleAcademicSubmit} disabled={loading}>
                    {loading ? 'Generating Questions...' : 'Continue to Assessment'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Questions Step */}
        {currentStep === 'questions' && questions.length > 0 && (
          <div className="space-y-6">
            {/* Progress */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
                  </span>
                </div>
                <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
              </CardContent>
            </Card>

            {/* Demo Auto-Fill Controls */}
            <Card className="border-dashed border-orange-200 bg-orange-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-600" />
                  <CardTitle className="text-sm text-orange-800">Demo Mode - Auto Fill</CardTitle>
                </div>
                <p className="text-xs text-orange-600">
                  Quickly fill all questions for demo purposes
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-orange-200 hover:bg-orange-100"
                    onClick={() => handleAutoFill('first')}
                  >
                    Fill All: First Option
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-orange-200 hover:bg-orange-100"
                    onClick={() => handleAutoFill('balanced')}
                  >
                    Fill All: Balanced Profile
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-orange-200 hover:bg-orange-100"
                    onClick={() => handleAutoFill('leadership')}
                  >
                    Fill All: Leadership Focus
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-orange-200 hover:bg-orange-100"
                    onClick={() => handleAutoFill('technical')}
                  >
                    Fill All: Technical Focus
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-orange-200 hover:bg-orange-100"
                    onClick={() => handleAutoFill('creative')}
                  >
                    Fill All: Creative Focus
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Current Question */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">
                    {questions[currentQuestionIndex].question_type.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline">
                    Level {questions[currentQuestionIndex].difficulty_level}
                  </Badge>
                </div>
                <CardTitle className="text-lg">
                  {questions[currentQuestionIndex].question}
                </CardTitle>
                {questions[currentQuestionIndex].scenario && (
                  <div className="p-3 bg-muted rounded-lg mt-3">
                    <p className="text-sm text-muted-foreground">
                      <strong>Scenario:</strong> {questions[currentQuestionIndex].scenario}
                    </p>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
                  {questions[currentQuestionIndex].options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="space-y-3">
                  <Label>How confident are you in this answer?</Label>
                  <div className="px-3">
                    <Slider
                      value={confidenceLevel}
                      onValueChange={setConfidenceLevel}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Not confident</span>
                      <span>Very confident</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAutoFill('balanced')}
                      className="text-xs"
                      disabled={loading}
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Skip to Results
                    </Button>
                    <Button 
                      onClick={handleNextQuestion}
                      disabled={!selectedAnswer || loading}
                    >
                      {currentQuestionIndex === questions.length - 1 ? 'Complete Assessment' : 'Next Question'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Step */}
        {currentStep === 'results' && personalityProfile && (
          <div className="space-y-6">
            {/* Existing Results Banner */}
            <Alert className="border-blue-200 bg-blue-50">
              <Brain className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Previous Assessment Found:</strong> Showing your latest career assessment results. 
                You can retake the test anytime to update your profile.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  Your Career Assessment Results
                </CardTitle>
                <p className="text-muted-foreground">
                  Here's your personalized career analysis
                </p>
                <div className="flex justify-center gap-3 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => handleRetakeTest()}
                    className="flex items-center gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    Retake Assessment
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Personality Traits */}
            <Card>
              <CardHeader>
                <CardTitle>Your Personality Profile</CardTitle>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">
                    Confidence Score: {Math.round(personalityProfile.confidence_score * 100)}%
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Assessment completed</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(personalityProfile.trait_scores).map(([trait, score]) => {
                    const Icon = getTraitIcon(trait);
                    return (
                      <div key={trait} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium capitalize">
                              {trait.replace('_', ' ')}
                            </span>
                            <Badge className={getTraitColor(score)}>
                              {Math.round(score * 100)}%
                            </Badge>
                          </div>
                          <Progress value={score * 100} className="h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Stream Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended Career Streams</CardTitle>
                <p className="text-muted-foreground">
                  Based on your personality traits and academic performance
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {personalityProfile.recommended_streams.slice(0, 3).map((stream, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{stream.stream}</h3>
                        <Badge className="bg-primary text-primary-foreground">
                          {stream.match_percentage}% Match
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {stream.description}
                      </p>
                      
                      {/* AI Insights Section */}
                      {stream.ai_insights && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">AI Insights</span>
                          </div>
                          <div className="space-y-2 text-sm">
                            {stream.ai_insights.personality_fit && (
                              <div>
                                <strong className="text-blue-700">Why this fits you:</strong>
                                <p className="text-blue-600">{stream.ai_insights.personality_fit}</p>
                              </div>
                            )}
                            {stream.ai_insights.jk_opportunities && (
                              <div>
                                <strong className="text-blue-700">J&K Opportunities:</strong>
                                <p className="text-blue-600">{stream.ai_insights.jk_opportunities}</p>
                              </div>
                            )}
                            {stream.ai_insights.next_steps && (
                              <div>
                                <strong className="text-blue-700">Next Steps:</strong>
                                <p className="text-blue-600">{stream.ai_insights.next_steps}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Career Paths:</strong>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {stream.career_paths.slice(0, 3).map((path, i) => (
                              <li key={i}>{path}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong>Salary Range:</strong> {stream.salary_range}<br />
                          <strong>Growth:</strong> {stream.growth_prospects}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Overall AI Guidance */}
                {personalityProfile.recommended_streams[0]?.overall_guidance && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">Personalized Career Guidance</span>
                    </div>
                    <p className="text-sm text-green-700">
                      {personalityProfile.recommended_streams[0].overall_guidance}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/stream-recommendations')} className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Explore All Streams
              </Button>
              <Button variant="outline" onClick={() => handleRetakeTest()} className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Retake Assessment
              </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading Display */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Processing your responses...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AIPsychometricTest;