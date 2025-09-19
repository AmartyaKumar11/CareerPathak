import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Users, 
  BookOpen,
  ExternalLink,
  Loader2,
  Star,
  Target,
  Briefcase,
  GraduationCap,
  ArrowLeft,
  Search,
  Globe,
  Building,
  Clock
} from 'lucide-react';

interface StreamRecommendation {
  id: string;
  name: string;
  category: string;
  matchPercentage: number;
  eligibility: string;
  entranceExams: string[];
  careerPaths: string[];
  topColleges: string[];
  salaryRange: string;
  description: string;
  ai_insights?: any;
}

interface CareerInsight {
  streamName: string;
  overview: string;
  marketTrends: {
    demand: string;
    growth: string;
    futureScope: string;
  };
  salaryInsights: {
    entryLevel: string;
    midLevel: string;
    senior: string;
  };
  skillsRequired: string[];
  topCompanies: string[];
  jobRoles: string[];
  educationPath: string[];
  challenges: string[];
  opportunities: string[];
  industryLinks: {
    title: string;
    url: string;
    source: string;
  }[];
  lastUpdated: string;
  confidence: number;
}

const CareerInsights: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<StreamRecommendation[]>([]);
  const [insights, setInsights] = useState<{ [key: string]: CareerInsight }>({});
  const [loading, setLoading] = useState(true);
  const [insightLoading, setInsightLoading] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<StreamRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      fetchStreamRecommendations();
    } else {
      setError('Please sign in to view career insights');
      setLoading(false);
    }
  }, [user]);

  const fetchStreamRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/get-user-recommendations/${encodeURIComponent(user!.email)}`);
      const data = await response.json();
      
      if (data.success && data.recommendations) {
        setRecommendations(data.recommendations.recommended_streams || []);
        if (data.recommendations.recommended_streams?.length > 0) {
          setSelectedStream(data.recommendations.recommended_streams[0]);
        }
      } else {
        // Fallback to mock data if no recommendations found
        const mockRecommendations: StreamRecommendation[] = [
          {
            id: '1',
            name: 'Computer Science Engineering',
            category: 'Engineering',
            matchPercentage: 92,
            eligibility: 'JEE Main/Advanced',
            entranceExams: ['JEE Main', 'JEE Advanced', 'BITSAT'],
            careerPaths: ['Software Developer', 'Data Scientist', 'AI Engineer'],
            topColleges: ['IIT Delhi', 'IIT Bombay', 'BITS Pilani'],
            salaryRange: '₹6-25 LPA',
            description: 'Focus on programming, algorithms, and computer systems'
          },
          {
            id: '2',
            name: 'Electronics & Communication Engineering',
            category: 'Engineering',
            matchPercentage: 87,
            eligibility: 'JEE Main/Advanced',
            entranceExams: ['JEE Main', 'JEE Advanced'],
            careerPaths: ['Electronics Engineer', 'Telecommunications Engineer', 'Hardware Designer'],
            topColleges: ['IIT Madras', 'IIT Kanpur', 'NIT Trichy'],
            salaryRange: '₹5-18 LPA',
            description: 'Study of electronic circuits, communication systems, and signal processing'
          },
          {
            id: '3',
            name: 'Mechanical Engineering',
            category: 'Engineering',
            matchPercentage: 79,
            eligibility: 'JEE Main/Advanced',
            entranceExams: ['JEE Main', 'JEE Advanced'],
            careerPaths: ['Mechanical Engineer', 'Design Engineer', 'Manufacturing Engineer'],
            topColleges: ['IIT Kharagpur', 'IIT Roorkee', 'NIT Surathkal'],
            salaryRange: '₹4-15 LPA',
            description: 'Design, development, and manufacturing of mechanical systems'
          }
        ];
        setRecommendations(mockRecommendations);
        setSelectedStream(mockRecommendations[0]);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const generateCareerInsights = async (streamName: string) => {
    setInsightLoading(streamName);
    
    try {
      // Simulate API call - replace with actual web scraping service
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock insight data - this will be replaced with real scraped data
      const mockInsight: CareerInsight = {
        streamName: streamName,
        overview: `${streamName} is a rapidly growing field with excellent career prospects. The industry is experiencing significant growth due to technological advancements and increasing demand for skilled professionals.`,
        marketTrends: {
          demand: "High - Expected to grow 15-20% annually",
          growth: "Exponential growth in emerging technologies",
          futureScope: "AI integration, automation, and innovation-driven roles"
        },
        salaryInsights: {
          entryLevel: "₹3-8 LPA",
          midLevel: "₹8-18 LPA", 
          senior: "₹18-50+ LPA"
        },
        skillsRequired: [
          "Technical expertise in core subjects",
          "Problem-solving abilities",
          "Programming skills",
          "Communication skills",
          "Project management"
        ],
        topCompanies: [
          "Google", "Microsoft", "Amazon", "Apple", "Meta",
          "TCS", "Infosys", "Wipro", "Accenture", "IBM"
        ],
        jobRoles: [
          "Software Engineer", "Senior Developer", "Technical Lead",
          "Product Manager", "Solution Architect", "Research Scientist"
        ],
        educationPath: [
          "Bachelor's degree in relevant field",
          "Master's degree (optional but beneficial)",
          "Professional certifications",
          "Continuous learning and upskilling"
        ],
        challenges: [
          "Rapidly changing technology landscape",
          "Need for continuous learning",
          "Competition in the job market",
          "Work-life balance in demanding roles"
        ],
        opportunities: [
          "High growth potential",
          "Global job market access",
          "Entrepreneurship opportunities",
          "Remote work possibilities",
          "Innovation and research opportunities"
        ],
        industryLinks: [
          {
            title: "Industry Salary Report 2024",
            url: "https://example.com/salary-report",
            source: "PayScale"
          },
          {
            title: "Career Growth Trends",
            url: "https://example.com/career-trends",
            source: "LinkedIn"
          },
          {
            title: "Top Companies Hiring",
            url: "https://example.com/top-companies",
            source: "Glassdoor"
          }
        ],
        lastUpdated: new Date().toISOString(),
        confidence: 0.85
      };
      
      setInsights(prev => ({
        ...prev,
        [streamName]: mockInsight
      }));
      
    } catch (err) {
      console.error('Failed to generate insights:', err);
      setError('Failed to generate career insights');
    } finally {
      setInsightLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading career insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-md mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Career Insights</h1>
            <p className="text-sm text-muted-foreground">AI-powered career analysis and market trends</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Stream Recommendations Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Your Stream Matches
                </CardTitle>
                <CardDescription>
                  Based on your psychometric assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendations.map((stream) => (
                  <div 
                    key={stream.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedStream?.id === stream.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedStream(stream)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm">{stream.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {stream.matchPercentage}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {stream.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Salary: {stream.salaryRange}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {selectedStream && (
              <>
                {/* Stream Overview */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedStream.name}</CardTitle>
                        <CardDescription>
                          {selectedStream.category} • {selectedStream.matchPercentage}% match
                        </CardDescription>
                      </div>
                      <Button 
                        onClick={() => generateCareerInsights(selectedStream.name)}
                        disabled={insightLoading === selectedStream.name}
                      >
                        {insightLoading === selectedStream.name ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating Insights...
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4 mr-2" />
                            Get AI Insights
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <div className="font-medium">Salary Range</div>
                        <div className="text-sm text-muted-foreground">{selectedStream.salaryRange}</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <div className="font-medium">Entrance Exams</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedStream.entranceExams.slice(0, 2).join(', ')}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <Briefcase className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                        <div className="font-medium">Career Paths</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedStream.careerPaths.length}+ options
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Career Insights */}
                {insights[selectedStream.name] && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        AI-Generated Career Insights
                        <Badge variant="outline" className="ml-auto">
                          {Math.round(insights[selectedStream.name].confidence * 100)}% Confidence
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Last updated: {new Date(insights[selectedStream.name].lastUpdated).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="market">Market</TabsTrigger>
                          <TabsTrigger value="salary">Salary</TabsTrigger>
                          <TabsTrigger value="skills">Skills</TabsTrigger>
                          <TabsTrigger value="companies">Companies</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                          <p className="text-sm leading-relaxed">
                            {insights[selectedStream.name].overview}
                          </p>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2 text-green-600">Opportunities</h4>
                              <ul className="space-y-1">
                                {insights[selectedStream.name].opportunities.map((opp, idx) => (
                                  <li key={idx} className="text-sm flex items-start gap-2">
                                    <Star className="h-3 w-3 mt-0.5 text-green-500" />
                                    {opp}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2 text-orange-600">Challenges</h4>
                              <ul className="space-y-1">
                                {insights[selectedStream.name].challenges.map((challenge, idx) => (
                                  <li key={idx} className="text-sm flex items-start gap-2">
                                    <Target className="h-3 w-3 mt-0.5 text-orange-500" />
                                    {challenge}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="market" className="space-y-4">
                          <div className="grid md:grid-cols-3 gap-4">
                            <Card>
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <TrendingUp className="h-4 w-4 text-green-500" />
                                  <h4 className="font-medium">Demand</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {insights[selectedStream.name].marketTrends.demand}
                                </p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Globe className="h-4 w-4 text-blue-500" />
                                  <h4 className="font-medium">Growth</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {insights[selectedStream.name].marketTrends.growth}
                                </p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="h-4 w-4 text-purple-500" />
                                  <h4 className="font-medium">Future Scope</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {insights[selectedStream.name].marketTrends.futureScope}
                                </p>
                              </CardContent>
                            </Card>
                          </div>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Industry Resources</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {insights[selectedStream.name].industryLinks.map((link, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                      <h5 className="font-medium text-sm">{link.title}</h5>
                                      <p className="text-xs text-muted-foreground">Source: {link.source}</p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="salary" className="space-y-4">
                          <div className="grid md:grid-cols-3 gap-4">
                            <Card>
                              <CardContent className="p-4 text-center">
                                <h4 className="font-medium text-green-600 mb-2">Entry Level</h4>
                                <div className="text-2xl font-bold">
                                  {insights[selectedStream.name].salaryInsights.entryLevel}
                                </div>
                                <p className="text-sm text-muted-foreground">0-2 years</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4 text-center">
                                <h4 className="font-medium text-blue-600 mb-2">Mid Level</h4>
                                <div className="text-2xl font-bold">
                                  {insights[selectedStream.name].salaryInsights.midLevel}
                                </div>
                                <p className="text-sm text-muted-foreground">3-7 years</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4 text-center">
                                <h4 className="font-medium text-purple-600 mb-2">Senior Level</h4>
                                <div className="text-2xl font-bold">
                                  {insights[selectedStream.name].salaryInsights.senior}
                                </div>
                                <p className="text-sm text-muted-foreground">8+ years</p>
                              </CardContent>
                            </Card>
                          </div>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Career Progression Path</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {insights[selectedStream.name].educationPath.map((step, idx) => (
                                  <div key={idx} className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                                      {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{step}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="skills" className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Required Skills</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {insights[selectedStream.name].skillsRequired.map((skill, idx) => (
                                  <Badge key={idx} variant="secondary">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Popular Job Roles</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid md:grid-cols-2 gap-3">
                                {insights[selectedStream.name].jobRoles.map((role, idx) => (
                                  <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{role}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="companies" className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Top Hiring Companies</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid md:grid-cols-2 gap-3">
                                {insights[selectedStream.name].topCompanies.map((company, idx) => (
                                  <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{company}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerInsights;