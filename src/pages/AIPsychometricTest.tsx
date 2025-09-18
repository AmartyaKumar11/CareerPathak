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

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

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

  if (!user) return null;

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

                <div className="text-center">
                  <Button onClick={handleStartTest} size="lg" className="px-8">
                    <Brain className="h-4 w-4 mr-2" />
                    Start Assessment
                  </Button>
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
                  <Button 
                    onClick={handleNextQuestion}
                    disabled={!selectedAnswer || loading}
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'Complete Assessment' : 'Next Question'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Step */}
        {currentStep === 'results' && personalityProfile && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  Assessment Complete!
                </CardTitle>
                <p className="text-muted-foreground">
                  Here's your personalized career analysis
                </p>
              </CardHeader>
            </Card>

            {/* Personality Traits */}
            <Card>
              <CardHeader>
                <CardTitle>Your Personality Profile</CardTitle>
                <p className="text-muted-foreground">
                  Confidence Score: {Math.round(personalityProfile.confidence_score * 100)}%
                </p>
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
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/stream-recommendations')}>
                View All Recommendations
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