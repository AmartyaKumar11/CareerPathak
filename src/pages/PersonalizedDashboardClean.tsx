import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LayoutDashboard, 
  TrendingUp, 
  MapPin, 
  Bell, 
  BookOpen,
  Wifi,
  WifiOff,
  RefreshCw,
  User,
  Settings,
  LogOut,
  Star,
  Clock,
  Target,
  Award,
  Map,
  BarChart3,
  Users,
  Calendar
} from 'lucide-react';

// Import improved components
import SmartStatsCards from '@/components/dashboard/SmartStatsCards';
import ImprovedQuickActions from '@/components/dashboard/ImprovedQuickActions';
import OnboardingTour from '@/components/dashboard/OnboardingTour';

interface DashboardStats {
  totalRecommendations: number;
  nearbyColleges: number;
  unreadNotifications: number;
  profileCompleteness: number;
}

const OfflineIndicator = ({ isOnline, onRefresh }: { isOnline: boolean; onRefresh: () => void }) => {
  if (isOnline) return null;

  return (
    <Alert className="mb-4">
      <WifiOff className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>You're offline. Showing cached data.</span>
        <Button variant="outline" size="sm" onClick={onRefresh} className="ml-2">
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
};



export const PersonalizedDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalRecommendations: 0,
    nearbyColleges: 0,
    unreadNotifications: 0,
    profileCompleteness: 0
  });

  // User profile for smart components
  const [userProfile, setUserProfile] = useState({
    hasCompletedQuiz: false,
    profileCompleteness: 65,
    lastActivity: new Date(),
    isFirstVisit: true
  });

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  // Initialize dashboard data
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        
        // Check if this is user's first visit
        const hasVisitedBefore = localStorage.getItem('careerpathak_visited');
        const hasCompletedQuiz = localStorage.getItem('careerpathak_quiz_completed');
        
        setUserProfile(prev => ({
          ...prev,
          isFirstVisit: !hasVisitedBefore,
          hasCompletedQuiz: !!hasCompletedQuiz,
          profileCompleteness: hasCompletedQuiz ? 85 : 45
        }));

        // Show onboarding for first-time users
        if (!hasVisitedBefore) {
          setShowOnboarding(true);
          localStorage.setItem('careerpathak_visited', 'true');
        }
        
        // Simulate loading some basic stats
        setTimeout(() => {
          setStats({
            totalRecommendations: hasCompletedQuiz ? 12 : 0,
            nearbyColleges: 8,
            unreadNotifications: 3,
            profileCompleteness: hasCompletedQuiz ? 85 : 45
          });
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        setLoading(false);
      }
    };

    if (user) {
      initializeDashboard();
    }
  }, [user]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const refreshData = async () => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  if (!user) {
    return null; // Will redirect via useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="dashboard-header border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary">CareerPathak</h1>
              <p className="text-xs text-muted-foreground">Your Career Journey</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <div className="text-right">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
            </div>
            
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <OfflineIndicator isOnline={isOnline} onRefresh={refreshData} />

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Welcome back, {user.name?.split(' ')[0] || 'Student'}!
          </h2>
          <p className="text-muted-foreground">
            {userProfile.isFirstVisit 
              ? "Let's get you started on your career journey!" 
              : "Ready to explore new opportunities and advance your career journey?"
            }
          </p>
          {!userProfile.hasCompletedQuiz && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>New here?</strong> Start with our aptitude quiz to get personalized recommendations!
              </p>
            </div>
          )}
        </div>

        {/* Smart Stats Cards */}
        <div className="stats-cards">
          <SmartStatsCards userProfile={userProfile} />
        </div>

        {/* Main Dashboard Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="recommendations" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="recommendations" className="recommendations-tab">
                  <TrendingUp className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Streams</span>
                  <span className="sm:hidden">Match</span>
                </TabsTrigger>
                <TabsTrigger value="colleges">
                  <MapPin className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Colleges</span>
                  <span className="sm:hidden">Map</span>
                </TabsTrigger>
                <TabsTrigger value="careers" className="hidden md:flex">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Careers
                </TabsTrigger>
                <TabsTrigger value="timeline" className="hidden md:flex">
                  <Calendar className="h-4 w-4 mr-2" />
                  Timeline
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recommendations" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {userProfile.hasCompletedQuiz ? 'Your Stream Matches' : 'Discover Your Perfect Stream'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {userProfile.hasCompletedQuiz 
                        ? 'Based on your interests and aptitude'
                        : 'Take our quiz to get personalized recommendations'
                      }
                    </p>
                  </CardHeader>
                  <CardContent>
                    {userProfile.hasCompletedQuiz ? (
                      <div className="space-y-4">
                        {[
                          { name: 'Computer Science Engineering', match: 92, icon: 'CS' },
                          { name: 'Electronics Engineering', match: 87, icon: 'EE' },
                          { name: 'Mechanical Engineering', match: 79, icon: 'ME' }
                        ].map((stream, index) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <span className="text-xs font-bold text-primary">{stream.icon}</span>
                              </div>
                              <div>
                                <h4 className="font-medium">{stream.name}</h4>
                                <p className="text-sm text-muted-foreground">High growth potential</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary">{stream.match}%</div>
                              <div className="text-xs text-muted-foreground">Match</div>
                            </div>
                          </div>
                        ))}
                        <div className="mt-6 pt-4 border-t">
                          <Button 
                            onClick={() => navigate('/recommendations')} 
                            variant="outline" 
                            className="w-full"
                          >
                            View All Personalized Recommendations
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Ready to discover your ideal career?</h3>
                        <p className="text-muted-foreground mb-6">
                          Our 15-minute aptitude quiz analyzes your interests, skills, and preferences to recommend the perfect career streams for you.
                        </p>
                        <Button onClick={() => navigate('/quiz')} size="lg" className="w-full md:w-auto">
                          <Target className="h-4 w-4 mr-2" />
                          Take Aptitude Quiz
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="colleges" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Nearby Government Colleges</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Quality education at affordable costs
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: 'NIT Srinagar', distance: '2.5 km', cutoff: '95k', fees: '₹2L/year' },
                        { name: 'IIIT Jammu', distance: '15 km', cutoff: '88k', fees: '₹3L/year' },
                        { name: 'Government College of Engineering', distance: '8 km', cutoff: '75k', fees: '₹80k/year' }
                      ].map((college, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{college.name}</h4>
                            <p className="text-sm text-muted-foreground">{college.distance} • {college.fees}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary">{college.cutoff}</div>
                            <div className="text-xs text-muted-foreground">JEE Rank</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="careers" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Career Path Insights</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Explore your future opportunities
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Career visualizations coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Academic Timeline</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Important dates and deadlines
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Timeline view coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="quick-actions">
              <ImprovedQuickActions />
            </div>
            
            <Card className="notifications-section">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { 
                      title: 'JEE Main 2024 Registration Open', 
                      time: '2 hours ago', 
                      type: 'exam',
                      priority: 'high'
                    },
                    { 
                      title: 'New Scholarship Available', 
                      time: '1 day ago', 
                      type: 'scholarship',
                      priority: 'medium'
                    },
                    { 
                      title: 'College Admission Deadline', 
                      time: '3 days ago', 
                      type: 'deadline',
                      priority: 'high'
                    }
                  ].map((notification, index) => (
                    <div key={index} className={`
                      flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:shadow-sm transition-shadow
                      ${notification.priority === 'high' ? 'bg-red-50 border border-red-200' : 'bg-muted/50'}
                    `}>
                      <div className={`
                        w-2 h-2 rounded-full mt-2
                        ${notification.priority === 'high' ? 'bg-red-500' : 'bg-primary'}
                      `}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                        {notification.priority === 'high' && (
                          <Badge variant="destructive" className="mt-1 text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Notifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Onboarding Tour */}
      <OnboardingTour 
        isVisible={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    </div>
  );
};
