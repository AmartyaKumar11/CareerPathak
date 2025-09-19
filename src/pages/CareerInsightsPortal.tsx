import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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
  AlertCircle,
  MapPin,
  Award,
  Heart,
  Share2,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  GraduationCap,
  Lightbulb,
  Calendar,
  TrendingDown,
  Filter,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StreamData {
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

interface CollegeData {
  id: string;
  name: string;
  location: string;
  type: 'Government' | 'Private' | 'Deemed';
  fees: string;
  rating: number;
  courses: string[];
  admissionDeadline: string;
  cutoff: string;
  placement: {
    average: string;
    highest: string;
    percentage: number;
  };
}

interface ScholarshipData {
  id: string;
  title: string;
  provider: string;
  amount: string;
  eligibility: string[];
  deadline: string;
  category: string;
  applicationLink: string;
}

interface AlumniStory {
  id: string;
  name: string;
  stream: string;
  currentRole: string;
  company: string;
  graduationYear: number;
  story: string;
  advice: string;
  linkedinProfile?: string;
}

interface TrendingSkill {
  id: string;
  name: string;
  category: string;
  demandGrowth: number;
  averageSalary: string;
  learningResources: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const CareerInsightsPortal: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { streamId } = useParams();
  const location = useLocation();
  const { toast } = useToast();

  // Get stream data from navigation state or fetch from API
  const [streamData, setStreamData] = useState<StreamData | null>(location.state?.stream || null);
  const [loading, setLoading] = useState(!streamData);
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [colleges, setColleges] = useState<CollegeData[]>([]);
  const [allColleges, setAllColleges] = useState<CollegeData[]>([]);
  const [displayedColleges, setDisplayedColleges] = useState<CollegeData[]>([]);
  const [collegesPage, setCollegesPage] = useState(1);
  const COLLEGES_PER_PAGE = 4;
  const [scholarships, setScholarships] = useState<ScholarshipData[]>([]);
  const [alumniStories, setAlumniStories] = useState<AlumniStory[]>([]);
  const [trendingSkills, setTrendingSkills] = useState<TrendingSkill[]>([]);

  // Loading states
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [loadingScholarships, setLoadingScholarships] = useState(false);
  const [loadingAlumni, setLoadingAlumni] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);

  // User interaction states
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userRating, setUserRating] = useState<'up' | 'down' | null>(null);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  // Load mock data for demonstration
  useEffect(() => {
    if (streamData) {
      loadMockData();
    }
  }, [streamData]);

  const loadMockData = () => {
    // Mock Colleges Data
    setColleges([
      {
        id: '1',
        name: 'Indian Institute of Technology Delhi',
        location: 'New Delhi',
        type: 'Government',
        fees: '₹2.5L/year',
        rating: 4.8,
        courses: ['Computer Science', 'Electronics', 'Mechanical'],
        admissionDeadline: '2024-04-15',
        cutoff: 'JEE Rank: 500-2000',
        placement: { average: '₹18L', highest: '₹45L', percentage: 95 }
      },
      {
        id: '2',
        name: 'Jammu University',
        location: 'Jammu, J&K',
        type: 'Government',
        fees: '₹50K/year',
        rating: 4.2,
        courses: ['Computer Applications', 'Management', 'Sciences'],
        admissionDeadline: '2024-06-30',
        cutoff: 'Merit Based: 80%+',
        placement: { average: '₹6L', highest: '₹15L', percentage: 75 }
      }
    ]);

    // Mock Scholarships Data
    setScholarships([
      {
        id: '1',
        title: 'J&K Merit Scholarship',
        provider: 'J&K Government',
        amount: '₹2L/year',
        eligibility: ['J&K Domicile', '85%+ in 12th', 'Family income < 4L'],
        deadline: '2024-05-15',
        category: 'State Scholarship',
        applicationLink: 'https://jkscholarships.gov.in'
      },
      {
        id: '2',
        title: 'INSPIRE Scholarship',
        provider: 'DST, Govt. of India',
        amount: '₹80,000/year',
        eligibility: ['Top 1% in 12th', 'Pursuing UG in Science'],
        deadline: '2024-07-31',
        category: 'National Scholarship',
        applicationLink: 'https://online-inspire.gov.in/'
      }
    ]);


    setLoading(false);
  };

  // Fetch recommended colleges from backend using selected stream
  useEffect(() => {
    async function fetchColleges() {
      if (!streamData?.name) {
        console.log('No stream data available');
        return;
      }
      console.log('Fetching colleges for stream:', streamData.name);
      setLoadingColleges(true);
      // Clear previous results
      setDisplayedColleges([]);
      setAllColleges([]);
      setColleges([]);
      setCollegesPage(1);
      try {
        const url = `http://localhost:3001/api/ai-recommended-colleges?stream=${encodeURIComponent(streamData.name)}`;
        console.log('Fetching from URL:', url);
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        console.log('Received data:', data);
        const receivedColleges = data.colleges || [];
        setAllColleges(receivedColleges);
        setColleges(receivedColleges);
        // Show only first 4 colleges initially
        setDisplayedColleges(receivedColleges.slice(0, COLLEGES_PER_PAGE));
        setCollegesPage(1);
        console.log('Set colleges:', receivedColleges.length, 'showing:', Math.min(4, receivedColleges.length));
      } catch (err) {
        console.error('Error fetching colleges:', err);
        setColleges([]);
      } finally {
        setLoadingColleges(false);
      }
    }
    fetchColleges();
  }, [streamData]);

  const loadMoreColleges = () => {
    const nextPage = collegesPage + 1;
    const startIndex = 0;
    const endIndex = nextPage * COLLEGES_PER_PAGE;
    const newDisplayedColleges = allColleges.slice(startIndex, endIndex);
    setDisplayedColleges(newDisplayedColleges);
    setCollegesPage(nextPage);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks',
      description: isBookmarked ? 'Insight removed from your saved items' : 'Insight saved for later viewing'
    });
  };

  const handleRating = (rating: 'up' | 'down') => {
    setUserRating(userRating === rating ? null : rating);
    toast({
      title: 'Thank you for your feedback!',
      description: 'Your rating helps us improve our recommendations'
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link copied!',
      description: 'Career insight link copied to clipboard'
    });
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-medium mb-2">Loading Career Insights Portal</h3>
          <p className="text-muted-foreground">Preparing your personalized career analysis...</p>
        </div>
      </div>
    );
  }

  if (!streamData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Stream Data Not Found</h3>
          <p className="text-muted-foreground mb-6">Unable to load stream information</p>
          <Button onClick={() => navigate('/career-insights')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Career Insights
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/career-insights')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-lg font-bold">{streamData.name}</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Career Analysis</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleBookmark}>
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 ml-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleRating('up')}
                className={userRating === 'up' ? 'text-green-600' : ''}
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleRating('down')}
                className={userRating === 'down' ? 'text-red-600' : ''}
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">{streamData.name}</h2>
                <p className="text-muted-foreground text-lg mb-4">{streamData.description}</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-1">
                  {streamData.match_percentage}%
                </div>
                <p className="text-sm text-muted-foreground">Match Score</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-xs text-muted-foreground">{streamData.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Salary Range</p>
                  <p className="text-xs text-muted-foreground">{streamData.salary_range}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Career Options</p>
                  <p className="text-xs text-muted-foreground">{streamData.career_paths.length}+ paths</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Growth</p>
                  <p className="text-xs text-muted-foreground">High Demand</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="colleges">Colleges</TabsTrigger>
            <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
            <TabsTrigger value="alumni">Alumni</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Career Paths */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Career Paths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {streamData.career_paths.slice(0, 6).map((path, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="text-sm font-medium">{path}</span>
                        <Badge variant="secondary" className="text-xs">Popular</Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Explore All Careers
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Market Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Job Market Growth</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
                      </div>
                      <span className="text-xs font-medium">High</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Competition Level</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{width: '60%'}}></div>
                      </div>
                      <span className="text-xs font-medium">Medium</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Skill Demand</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '85%'}}></div>
                      </div>
                      <span className="text-xs font-medium">Very High</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                      <div>
                        <p className="text-sm font-medium">Complete Your Profile</p>
                        <p className="text-xs text-muted-foreground">Add more details for better recommendations</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                      <div>
                        <p className="text-sm font-medium">Explore Colleges</p>
                        <p className="text-xs text-muted-foreground">Find the best colleges for your stream</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                      <div>
                        <p className="text-sm font-medium">Apply for Scholarships</p>
                        <p className="text-xs text-muted-foreground">Reduce your education costs</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Colleges Tab */}
          <TabsContent value="colleges">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Recommended Colleges</h3>
                  <p className="text-muted-foreground">
                    {allColleges.length > 0 
                      ? `Found ${allColleges.length} colleges for ${streamData.name} • Showing ${displayedColleges.length}`
                      : `Best colleges for ${streamData.name} based on your profile`
                    }
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>

              {loadingColleges ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-medium mb-2">Finding Best Colleges</h3>
                  <p className="text-muted-foreground">AI is analyzing colleges that match your stream...</p>
                </div>
              ) : displayedColleges.length > 0 ? (
                <div className="grid lg:grid-cols-2 gap-6">
                  {displayedColleges.map((college) => (
                  <Card key={college.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{college.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{college.location}</span>
                            <Badge variant="outline" className="text-xs">{college.type}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold">{college.rating}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Annual Fees</p>
                            <p className="font-semibold">{college.fees}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Cutoff</p>
                            <p className="font-semibold text-sm">{college.cutoff}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Available Courses</p>
                          <div className="flex flex-wrap gap-1">
                            {college.courses.map((course, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {course}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-muted/50 p-2 rounded">
                            <p className="text-xs text-muted-foreground">Avg. Package</p>
                            <p className="text-sm font-semibold">{college.placement.average}</p>
                          </div>
                          <div className="bg-muted/50 p-2 rounded">
                            <p className="text-xs text-muted-foreground">Highest</p>
                            <p className="text-sm font-semibold">{college.placement.highest}</p>
                          </div>
                          <div className="bg-muted/50 p-2 rounded">
                            <p className="text-xs text-muted-foreground">Placement</p>
                            <p className="text-sm font-semibold">{college.placement.percentage}%</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Colleges Found</h3>
                  <p className="text-muted-foreground mb-4">
                    We couldn't find colleges matching your stream. Try a different stream or check back later.
                  </p>
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Streams
                  </Button>
                </div>
              )}

              {displayedColleges.length < allColleges.length && (
                <div className="text-center">
                  <Button variant="outline" onClick={loadMoreColleges}>
                    Load More Colleges ({allColleges.length - displayedColleges.length} remaining)
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Scholarships Tab */}
          <TabsContent value="scholarships">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold">Available Scholarships</h3>
                <p className="text-muted-foreground">Financial aid opportunities for your education</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {scholarships.map((scholarship) => (
                  <Card key={scholarship.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{scholarship.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{scholarship.provider}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {scholarship.amount}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Eligibility Criteria</p>
                          <ul className="space-y-1">
                            {scholarship.eligibility.map((criteria, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                {criteria}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                          <div>
                            <p className="text-xs text-muted-foreground">Application Deadline</p>
                            <p className="font-semibold text-sm">{scholarship.deadline}</p>
                          </div>
                          <Badge variant="outline">{scholarship.category}</Badge>
                        </div>

                        <Button className="w-full" asChild>
                          <a href={scholarship.applicationLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Apply Now
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <Button variant="outline">
                  View More Scholarships
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Alumni Tab */}
          <TabsContent value="alumni">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold">Alumni Success Stories</h3>
                <p className="text-muted-foreground">Learn from graduates who've walked this path</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {alumniStories.map((alumni) => (
                  <Card key={alumni.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{alumni.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{alumni.currentRole} at {alumni.company}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{alumni.stream}</Badge>
                            <span className="text-xs text-muted-foreground">Class of {alumni.graduationYear}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Journey</p>
                          <p className="text-sm text-muted-foreground">{alumni.story}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-2">Advice for You</p>
                          <p className="text-sm text-muted-foreground italic">"{alumni.advice}"</p>
                        </div>

                        {alumni.linkedinProfile && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={alumni.linkedinProfile} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Connect on LinkedIn
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <Button variant="outline">
                  View More Stories
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold">Trending Skills</h3>
                <p className="text-muted-foreground">In-demand skills for your career path</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {trendingSkills.map((skill) => (
                  <Card key={skill.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{skill.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{skill.category}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-green-600">
                            <TrendingUp className="h-4 w-4" />
                            <span className="font-bold">+{skill.demandGrowth}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Growth</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Average Salary</p>
                            <p className="font-semibold">{skill.averageSalary}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Difficulty</p>
                            <Badge variant={skill.difficulty === 'Beginner' ? 'secondary' : skill.difficulty === 'Intermediate' ? 'default' : 'destructive'}>
                              {skill.difficulty}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-2">Learning Resources</p>
                          <ul className="space-y-1">
                            {skill.learningResources.map((resource, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                                <BookOpen className="h-3 w-3" />
                                {resource}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Button size="sm" className="w-full">
                          <Lightbulb className="h-4 w-4 mr-2" />
                          Start Learning
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        {/* Footer */}
        <footer className="border-t bg-muted/50 py-6">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              Career insights powered by AI • Data updated regularly • 
              <Button variant="link" size="sm" className="p-0 ml-2">
                Report an issue
              </Button>
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default CareerInsightsPortal;