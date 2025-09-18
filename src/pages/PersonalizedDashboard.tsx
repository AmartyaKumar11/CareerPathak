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

// Import dashboard components
import { StreamRecommendations } from '@/components/dashboard/StreamRecommendations';
import { NearbyColleges } from '@/components/dashboard/NearbyColleges';
import { CareerPathVisualizations } from '@/components/dashboard/CareerPathVisualizations';
import { NotificationCenter } from '@/components/dashboard/NotificationCenter';

// Import services
import { dashboardDB, generateMockNotifications } from '@/services/dashboardDataService';
import { useProfileStore } from '@/stores/profileStore';

interface DashboardStats {
  totalRecommendations: number;
  nearbyColleges: number;
  unreadNotifications: number;
  profileCompleteness: number;
}

const OfflineIndicator = ({ isOnline, onRefresh }: { isOnline: boolean; onRefresh: () => void }) => {
  if (isOnline) return null;

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <WifiOff className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-orange-800">
          You're offline. Showing cached data from your last sync.
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          className="ml-2 border-orange-300 text-orange-700 hover:bg-orange-100"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </AlertDescription>
    </Alert>
  );
};

const DashboardStatsCard = ({ stats, isOnline }: { stats: DashboardStats; isOnline: boolean }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Stream Matches</CardTitle>
        <Target className="h-4 w-4 text-blue-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-blue-600">{stats.totalRecommendations}</div>
        <p className="text-xs text-muted-foreground">
          Based on your profile
        </p>
      </CardContent>
    </Card>

    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Nearby Colleges</CardTitle>
        <MapPin className="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-600">{stats.nearbyColleges}</div>
        <p className="text-xs text-muted-foreground">
          Within 50km radius
        </p>
      </CardContent>
    </Card>

    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Notifications</CardTitle>
        <Bell className="h-4 w-4 text-orange-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-orange-600">{stats.unreadNotifications}</div>
        <p className="text-xs text-muted-foreground">
          Unread alerts
        </p>
      </CardContent>
    </Card>

    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Profile</CardTitle>
        <Award className="h-4 w-4 text-purple-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-purple-600">{stats.profileCompleteness}%</div>
        <p className="text-xs text-muted-foreground">
          Complete for better matches
        </p>
      </CardContent>
    </Card>
  </div>
);

const QuickActions = ({ onViewProfile, onOpenSettings }: { onViewProfile: () => void; onOpenSettings: () => void }) => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <LayoutDashboard className="h-5 w-5" />
        Quick Actions
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button variant="outline" className="flex items-center gap-2" onClick={onViewProfile}>
          <User className="h-4 w-4" />
          View Profile
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Take Quiz
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Map className="h-4 w-4" />
          Explore Colleges
        </Button>
        <Button variant="outline" className="flex items-center gap-2" onClick={onOpenSettings}>
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>
    </CardContent>
  </Card>
);

export const PersonalizedDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { currentProfile, isOnline } = useProfileStore();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalRecommendations: 0,
    nearbyColleges: 0,
    unreadNotifications: 0,
    profileCompleteness: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [currentProfile]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      await dashboardDB.init();

      // Load cached data
      const [recommendations, colleges, notifications] = await Promise.all([
        dashboardDB.getStreamRecommendations(),
        dashboardDB.getNearbyColleges(50),
        dashboardDB.getUnreadNotifications()
      ]);

      // Calculate stats
      const profileCompleteness = calculateProfileCompleteness(currentProfile);
      
      setStats({
        totalRecommendations: recommendations.length,
        nearbyColleges: colleges.length,
        unreadNotifications: notifications.length,
        profileCompleteness
      });

      // If online, try to fetch fresh data
      if (isOnline) {
        await syncDashboardData();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncDashboardData = async () => {
    try {
      // In a real app, these would be API calls
      // For now, we'll use mock data
      const mockNotifications = generateMockNotifications();
      await dashboardDB.saveNotifications(mockNotifications);
      
      // Update cache timestamps
      await dashboardDB.setCacheTimestamp('notifications', Date.now());
      await dashboardDB.setCacheTimestamp('recommendations', Date.now());
      await dashboardDB.setCacheTimestamp('colleges', Date.now());
    } catch (error) {
      console.error('Error syncing dashboard data:', error);
    }
  };

  const calculateProfileCompleteness = (profile: any): number => {
    if (!profile) return 0;
    
    let completedFields = 0;
    let totalFields = 10; // Adjust based on profile structure
    
    if (profile.personalDetails?.firstName) completedFields++;
    if (profile.personalDetails?.email) completedFields++;
    if (profile.personalDetails?.phone) completedFields++;
    if (profile.academicInfo?.currentClass) completedFields++;
    if (profile.academicInfo?.subjects?.length > 0) completedFields++;
    if (profile.preferences?.interestedStreams?.length > 0) completedFields++;
    if (profile.preferences?.location) completedFields++;
    if (profile.preferences?.budgetRange) completedFields++;
    if (profile.preferences?.careerGoals?.length > 0) completedFields++;
    if (profile.additionalInfo?.extracurriculars?.length > 0) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  const handleOpenSettings = () => {
    navigate('/settings');
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">CareerPathak</h1>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                {isOnline ? (
                  <>
                    <Wifi className="h-3 w-3 text-green-600" />
                    Online
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 text-orange-600" />
                    Offline
                  </>
                )}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email}
                  </p>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Offline Indicator */}
        <OfflineIndicator isOnline={isOnline} onRefresh={handleRefresh} />

        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
          </h2>
          <p className="text-gray-600">
            Here's your personalized career guidance dashboard
          </p>
        </div>

        {/* Stats Cards */}
        <DashboardStatsCard stats={stats} isOnline={isOnline} />

        {/* Quick Actions */}
        <QuickActions onViewProfile={handleViewProfile} onOpenSettings={handleOpenSettings} />

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="colleges" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Colleges
            </TabsTrigger>
            <TabsTrigger value="careers" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Career Paths
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alerts
              {stats.unreadNotifications > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {stats.unreadNotifications}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Top Stream Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StreamRecommendations />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    Nearby Colleges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <NearbyColleges />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-600" />
                  Recent Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationCenter />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="colleges">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  Government Colleges Near You
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NearbyColleges />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="careers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Career Path Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CareerPathVisualizations />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-600" />
                  All Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationCenter />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
