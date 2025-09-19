import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Brain, 
  TrendingUp, 
  Target, 
  Briefcase, 
  DollarSign,
  Users,
  BookOpen,
  Loader2,
  Star,
  Clock,
  Building,
  AlertCircle
} from 'lucide-react';

// Import the AI service
import { aiPsychometricService } from '@/services/aiPsychometricService';
import { useToast } from '@/hooks/use-toast';

interface StreamRecommendation {
  id: string;
  stream: string;
  name: string;
  match_percentage: number;
  category: string;
  career_paths: string[];
  salary_range: string;
  description: string;
  eligibility?: string;
  entrance_exams?: string[];
  top_colleges?: string[];
  ai_insights?: any;
}

interface CareerInsight {
  overview: string;
  keySkills: string[];
  careerPaths: string[];
  salaryTrends: {
    entry: string;
    mid: string;
    senior: string;
  };
  marketDemand: string;
  growthProspects: string;
  personality_fit?: string;
  jk_opportunities?: string;
  challenges?: string;
  next_steps?: string;
}

const CareerInsightsSimple: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [streamRecommendations, setStreamRecommendations] = useState<StreamRecommendation[]>([]);
  const [selectedStream, setSelectedStream] = useState<StreamRecommendation | null>(null);
  const [careerInsights, setCareerInsights] = useState<CareerInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  // Fetch real stream recommendations from AI backend
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user?.email) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // First, try to get existing recommendations
        const existingRecommendations = await aiPsychometricService.getUserRecommendations(user.email);
        
        if (existingRecommendations && existingRecommendations.recommended_streams) {
          const formattedRecommendations: StreamRecommendation[] = existingRecommendations.recommended_streams.map((stream: any, index: number) => ({
            id: `stream-${index}`,
            stream: stream.stream,
            name: stream.stream,
            match_percentage: Math.round(stream.match_percentage),
            category: stream.category || 'General',
            career_paths: stream.career_paths || [],
            salary_range: stream.salary_range || 'Varies',
            description: stream.description || 'No description available',
            eligibility: stream.eligibility || 'Check individual requirements',
            entrance_exams: stream.entrance_exams || [],
            top_colleges: stream.top_colleges || [],
            ai_insights: stream.ai_insights
          }));
          
          setStreamRecommendations(formattedRecommendations);
          setSelectedStream(formattedRecommendations[0]); // Auto-select first stream
        } else {
          // No recommendations found - user might not have completed assessment
          setError('No stream recommendations found. Please complete your psychometric assessment first.');
          setStreamRecommendations([]);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setError('Failed to load recommendations. Please try again.');
        
        // Show fallback message
        toast({
          title: 'Unable to Load Recommendations',
          description: 'Please complete your psychometric assessment to get personalized recommendations.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRecommendations();
    }
  }, [user, toast]);

  const generateInsights = async (stream: StreamRecommendation) => {
    setGeneratingInsights(true);
    
    try {
      // If the stream already has AI insights from the backend, use them
      if (stream.ai_insights) {
        const aiInsights = stream.ai_insights;
        const enhancedInsights: CareerInsight = {
          overview: aiInsights.personality_fit || `${stream.name} is a highly dynamic field with excellent growth prospects.`,
          keySkills: [
            'Technical Proficiency',
            'Problem Solving', 
            'Communication',
            'Team Collaboration',
            'Continuous Learning',
            'Project Management'
          ],
          careerPaths: stream.career_paths,
          salaryTrends: {
            entry: '₹4-8 LPA',
            mid: '₹12-20 LPA', 
            senior: '₹25-50 LPA'
          },
          marketDemand: 'High demand with growing opportunities',
          growthProspects: 'Excellent with emerging technologies',
          personality_fit: aiInsights.personality_fit,
          jk_opportunities: aiInsights.jk_opportunities,
          challenges: aiInsights.challenges,
          next_steps: aiInsights.next_steps
        };
        
        setCareerInsights(enhancedInsights);
        setGeneratingInsights(false);
        return;
      }
      
      // Otherwise, generate mock insights (fallback)
      setTimeout(() => {
        const mockInsights: CareerInsight = {
          overview: `${stream.name} is a highly dynamic field with excellent growth prospects. The industry is experiencing rapid expansion with emerging technologies creating new opportunities every year.`,
          keySkills: [
            'Technical Proficiency',
            'Problem Solving',
            'Communication', 
            'Team Collaboration',
            'Continuous Learning',
            'Project Management'
          ],
          careerPaths: stream.career_paths,
          salaryTrends: {
            entry: '₹4-8 LPA',
            mid: '₹12-20 LPA',
            senior: '₹25-50 LPA'
          },
          marketDemand: 'Very High - Growing at 15% annually',
          growthProspects: 'Excellent with emerging technologies like AI, ML, and Cloud Computing'
        };
        
        setCareerInsights(mockInsights);
        setGeneratingInsights(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate insights. Please try again.',
        variant: 'destructive',
      });
      setGeneratingInsights(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Career Insights</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Analysis</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Career Insights Dashboard</h2>
          <p className="text-muted-foreground text-lg">
            Get personalized career recommendations based on your psychometric assessment
          </p>
        </div>

        {loading ? (
          // Loading state
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-medium mb-2">Loading Your Recommendations</h3>
              <p className="text-muted-foreground">
                Fetching your personalized stream recommendations...
              </p>
            </div>
          </div>
        ) : error ? (
          // Error state
          <div className="max-w-md mx-auto">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="mb-4">
                {error}
              </AlertDescription>
            </Alert>
            <div className="mt-6 text-center space-y-3">
              <Button onClick={() => navigate('/quiz')} size="lg">
                <Target className="mr-2 h-4 w-4" />
                Take Psychometric Assessment
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <Loader2 className="mr-2 h-4 w-4" />
                Retry Loading
              </Button>
            </div>
          </div>
        ) : streamRecommendations.length === 0 ? (
          // No recommendations state
          <div className="max-w-lg mx-auto text-center">
            <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-4">No Recommendations Found</h3>
            <p className="text-muted-foreground mb-6">
              Complete your psychometric assessment to get personalized career insights and stream recommendations.
            </p>
            <Button onClick={() => navigate('/quiz')} size="lg">
              <Target className="mr-2 h-4 w-4" />
              Start Assessment
            </Button>
          </div>
        ) : (
          // Main recommendations display
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Stream Recommendations - Left Panel */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Your Top Matches ({streamRecommendations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {streamRecommendations.map((stream) => (
                    <div
                      key={stream.id}
                      onClick={() => setSelectedStream(stream)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedStream?.id === stream.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-sm">{stream.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {stream.match_percentage}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {stream.description.substring(0, 80)}...
                      </p>
                      <div className="flex items-center gap-2 text-xs text-primary">
                        <DollarSign className="h-3 w-3" />
                        {stream.salary_range}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Right Panel */}
            <div className="lg:col-span-2">
              {selectedStream && (
                <div className="space-y-6">
                  {/* Selected Stream Overview */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{selectedStream.name}</CardTitle>
                          <p className="text-muted-foreground mt-1">{selectedStream.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {selectedStream.match_percentage}%
                          </div>
                          <p className="text-sm text-muted-foreground">Match Score</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-primary" />
                          <span className="text-sm">Category: {selectedStream.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span className="text-sm">Salary: {selectedStream.salary_range}</span>
                        </div>
                        {selectedStream.eligibility && (
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span className="text-sm">Eligibility: {selectedStream.eligibility}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Career Paths:</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedStream.career_paths.map((path, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {path}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {selectedStream.entrance_exams && selectedStream.entrance_exams.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Entrance Exams:</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedStream.entrance_exams.map((exam, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {exam}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={() => navigate(`/career-insights-portal/${selectedStream.id}`, { 
                          state: { stream: selectedStream } 
                        })}
                        disabled={generatingInsights}
                        className="w-full"
                        size="lg"
                      >
                        {generatingInsights ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating AI Insights...
                          </>
                        ) : (
                          <>
                            <Brain className="mr-2 h-4 w-4" />
                            Get AI-Powered Career Insights
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* AI Insights */}
                  {careerInsights && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-primary" />
                          AI Career Analysis for {selectedStream.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="overview">
                          <TabsList className="grid grid-cols-4 w-full">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="skills">Skills</TabsTrigger>
                            <TabsTrigger value="salary">Salary</TabsTrigger>
                            <TabsTrigger value="market">Market</TabsTrigger>
                          </TabsList>

                          <TabsContent value="overview" className="mt-4">
                            <div className="space-y-4">
                              <p className="text-sm text-muted-foreground">
                                {careerInsights.overview}
                              </p>
                              
                              {careerInsights.personality_fit && (
                                <div>
                                  <h4 className="font-medium mb-2">Why This Stream Fits You:</h4>
                                  <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
                                    {careerInsights.personality_fit}
                                  </p>
                                </div>
                              )}
                              
                              {careerInsights.jk_opportunities && (
                                <div>
                                  <h4 className="font-medium mb-2">Opportunities in J&K:</h4>
                                  <p className="text-sm text-muted-foreground bg-green-50 p-3 rounded-lg">
                                    {careerInsights.jk_opportunities}
                                  </p>
                                </div>
                              )}
                              
                              <div>
                                <h4 className="font-medium mb-2">Career Opportunities:</h4>
                                <div className="grid md:grid-cols-2 gap-2">
                                  {careerInsights.careerPaths.map((path, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                      <Star className="h-3 w-3 text-yellow-500" />
                                      <span className="text-sm">{path}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="skills" className="mt-4">
                            <div>
                              <h4 className="font-medium mb-3">Essential Skills for Success:</h4>
                              <div className="grid md:grid-cols-2 gap-3">
                                {careerInsights.keySkills.map((skill, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                    <span className="text-sm">{skill}</span>
                                  </div>
                                ))}
                              </div>
                              
                              {careerInsights.next_steps && (
                                <div className="mt-4">
                                  <h4 className="font-medium mb-2">Next Steps:</h4>
                                  <p className="text-sm text-muted-foreground bg-orange-50 p-3 rounded-lg">
                                    {careerInsights.next_steps}
                                  </p>
                                </div>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="salary" className="mt-4">
                            <div className="space-y-4">
                              <h4 className="font-medium">Salary Progression:</h4>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                  <span className="text-sm font-medium">Entry Level (0-2 years)</span>
                                  <span className="text-sm font-bold text-green-600">
                                    {careerInsights.salaryTrends.entry}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                  <span className="text-sm font-medium">Mid Level (3-7 years)</span>
                                  <span className="text-sm font-bold text-blue-600">
                                    {careerInsights.salaryTrends.mid}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                  <span className="text-sm font-medium">Senior Level (8+ years)</span>
                                  <span className="text-sm font-bold text-purple-600">
                                    {careerInsights.salaryTrends.senior}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="market" className="mt-4">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Market Demand:</h4>
                                <p className="text-sm text-muted-foreground">
                                  {careerInsights.marketDemand}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Growth Prospects:</h4>
                                <p className="text-sm text-muted-foreground">
                                  {careerInsights.growthProspects}
                                </p>
                              </div>
                              
                              {careerInsights.challenges && (
                                <div>
                                  <h4 className="font-medium mb-2">Challenges & Solutions:</h4>
                                  <p className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded-lg">
                                    {careerInsights.challenges}
                                  </p>
                                </div>
                              )}
                              
                              <Alert>
                                <TrendingUp className="h-4 w-4" />
                                <AlertDescription>
                                  This field shows strong growth potential with increasing demand 
                                  for skilled professionals in the coming years.
                                </AlertDescription>
                              </Alert>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CareerInsightsSimple;