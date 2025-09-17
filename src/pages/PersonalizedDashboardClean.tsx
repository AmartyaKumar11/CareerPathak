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

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { 
      icon: Target, 
      label: 'Take Quiz', 
      description: 'Aptitude Assessment',
      color: 'bg-blue-500',
      onClick: () => navigate('/quiz')
    },
    { 
      icon: Map, 
      label: 'Find Colleges', 
      description: 'Near You',
      color: 'bg-green-500',
      onClick: () => navigate('/nearby-colleges-map')
    },
    { 
      icon: BarChart3, 
      label: 'Career Paths', 
      description: 'Explore Options',
      color: 'bg-purple-500',
      onClick: () => navigate('/careers')
    },
    { 
      icon: Users, 
      label: 'Connect', 
      description: 'Alumni Network',
      color: 'bg-orange-500',
      onClick: () => navigate('/network')
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={action.onClick}
            >
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded ${action.color} text-white`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const PersonalizedDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalRecommendations: 0,
    nearbyColleges: 0,
    unreadNotifications: 0,
    profileCompleteness: 0
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
        
        // Simulate loading some basic stats
        setTimeout(() => {
          setStats({
            totalRecommendations: 12,
            nearbyColleges: 8,
            unreadNotifications: 3,
            profileCompleteness: 85
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
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary">CareerPathak</h1>
              <p className="text-xs text-muted-foreground">Your Career Journey</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <div className="text-right">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
            </div>
            
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <OfflineIndicator isOnline={isOnline} onRefresh={refreshData} />

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user.name?.split(' ')[0] || 'Student'}! 👋
          </h2>
          <p className="text-muted-foreground">
            Ready to explore new opportunities and advance your career journey?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/stream-recommendations')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Stream Matches
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {stats.totalRecommendations}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
              <Badge variant="secondary" className="mt-2">
                Based on your profile
              </Badge>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/nearby-colleges-map')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Nearby Colleges
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {stats.nearbyColleges}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-green-500" />
              </div>
              <Badge variant="secondary" className="mt-2">
                View on Map
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Notifications
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {stats.unreadNotifications}
                  </p>
                </div>
                <Bell className="h-8 w-8 text-orange-500" />
              </div>
              <Badge variant="secondary" className="mt-2">
                New updates
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Profile Complete
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {stats.profileCompleteness}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
              <Badge variant="secondary" className="mt-2">
                Almost there!
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="recommendations" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="recommendations">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Streams
                </TabsTrigger>
                <TabsTrigger value="colleges">
                  <MapPin className="h-4 w-4 mr-2" />
                  Colleges
                </TabsTrigger>
                <TabsTrigger value="careers">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Careers
                </TabsTrigger>
                <TabsTrigger value="timeline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Timeline
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recommendations" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Streams</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Based on your interests and aptitude
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: 'Computer Science Engineering', match: 92, icon: '💻' },
                        { name: 'Electronics Engineering', match: 87, icon: '⚡' },
                        { name: 'Mechanical Engineering', match: 79, icon: '⚙️' }
                      ].map((stream, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{stream.icon}</span>
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
                    </div>
                    <div className="mt-6 pt-4 border-t">
                      <Button 
                        onClick={() => navigate('/recommendations')} 
                        variant="outline" 
                        className="w-full"
                      >
                        View All Personalized Recommendations
                      </Button>
                    </div>
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
            <QuickActions />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { title: 'JEE Main 2024 Registration Open', time: '2 hours ago', type: 'exam' },
                    { title: 'New Scholarship Available', time: '1 day ago', type: 'scholarship' },
                    { title: 'College Admission Deadline', time: '3 days ago', type: 'deadline' }
                  ].map((notification, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
