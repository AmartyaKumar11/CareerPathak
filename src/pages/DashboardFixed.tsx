import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Settings
} from 'lucide-react';
import { StreamRecommendations } from '@/components/dashboard/StreamRecommendations';
import { NearbyColleges } from '@/components/dashboard/NearbyColleges';
import { CareerPathVisualizations } from '@/components/dashboard/CareerPathVisualizations';
import { NotificationCenter } from '@/components/dashboard/NotificationCenter';
import { useNetworkStatus, useUnreadNotificationCount } from '@/services/dashboardService';
import { dashboardDB } from '@/services/dashboardDatabase';

interface OfflineIndicatorProps {
  isOnline: boolean;
  onRefresh?: () => void;
}

const OfflineIndicator = ({ isOnline, onRefresh }: OfflineIndicatorProps) => {
  if (isOnline) return null;

  return (
    <Alert className="border-orange-200 bg-orange-50 mb-6">
      <WifiOff className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-orange-700">
          You're offline. Showing cached data from your last sync.
        </span>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

interface DashboardStatsProps {
  unreadCount: number;
  isOnline: boolean;
}

const DashboardStats = ({ unreadCount, isOnline }: DashboardStatsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Stream Match</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-blue-600">95%</div>
        <p className="text-xs text-muted-foreground">CS & Engineering</p>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Nearby Colleges</CardTitle>
        <MapPin className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-600">24</div>
        <p className="text-xs text-muted-foreground">Within 50km</p>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Notifications</CardTitle>
        <Bell className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
        <p className="text-xs text-muted-foreground">Unread alerts</p>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Connection</CardTitle>
        {isOnline ? 
          <Wifi className="h-4 w-4 text-green-500" /> : 
          <WifiOff className="h-4 w-4 text-red-500" />
        }
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </div>
        <p className="text-xs text-muted-foreground">
          {isOnline ? 'Real-time data' : 'Cached data'}
        </p>
      </CardContent>
    </Card>
  </div>
);

interface QuickActionsProps {
  onViewProfile: () => void;
  onOpenSettings: () => void;
}

const QuickActions = ({ onViewProfile, onOpenSettings }: QuickActionsProps) => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle className="text-lg">Quick Actions</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onViewProfile}>
          <User className="w-4 h-4 mr-2" />
          View Profile
        </Button>
        <Button variant="outline" onClick={onOpenSettings}>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
        <Button variant="outline">
          <BookOpen className="w-4 h-4 mr-2" />
          Take Assessment
        </Button>
        <Button variant="outline">
          <MapPin className="w-4 h-4 mr-2" />
          Find Colleges
        </Button>
      </div>
    </CardContent>
  </Card>
);

export const Dashboard = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string | null>(null);
  
  // Add error boundary for unread count
  const unreadCountQuery = useUnreadNotificationCount();
  const unreadCount = unreadCountQuery.data || 0;
  
  if (unreadCountQuery.error) {
    console.error('Error loading unread notifications:', unreadCountQuery.error);
  }

  const networkStatus = useNetworkStatus();

  useEffect(() => {
    // Initialize dashboard database
    const initDB = async () => {
      try {
        await dashboardDB.init();
        console.log('Dashboard database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize dashboard database:', error);
        setError('Failed to initialize dashboard. Please refresh the page.');
      }
    };
    
    initDB();

    // Set up network status listeners
    try {
      const cleanup = networkStatus.addEventListener(setIsOnline);
      return cleanup;
    } catch (error) {
      console.error('Failed to set up network listeners:', error);
    }
  }, [networkStatus]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleViewProfile = () => {
    window.location.href = '/profile';
  };

  const handleOpenSettings = () => {
    console.log('Open settings');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <LayoutDashboard className="w-8 h-8 text-blue-600" />
                Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Your personalized career guidance hub
              </p>
            </div>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Badge>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="border-red-200 bg-red-50 mb-6">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Offline Indicator */}
        <OfflineIndicator isOnline={isOnline} onRefresh={handleRefresh} />

        {/* Dashboard Stats */}
        <DashboardStats unreadCount={unreadCount} isOnline={isOnline} />

        {/* Quick Actions */}
        <QuickActions 
          onViewProfile={handleViewProfile} 
          onOpenSettings={handleOpenSettings} 
        />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="colleges">Colleges</TabsTrigger>
            <TabsTrigger value="career-paths">Career Paths</TabsTrigger>
            <TabsTrigger value="notifications" className="relative">
              Notifications
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs bg-red-500">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            <StreamRecommendations />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Notifications</h3>
                <div className="space-y-4">
                  <NotificationCenter />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Career Insights</h3>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center space-y-2">
                      <TrendingUp className="w-12 h-12 text-blue-500 mx-auto" />
                      <h4 className="font-semibold">Career Growth Projection</h4>
                      <p className="text-sm text-gray-600">
                        Based on your profile, the Computer Science field shows 
                        120% growth potential over the next 5 years.
                      </p>
                      <Button variant="outline" size="sm">
                        View Full Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="colleges" className="mt-6">
            <NearbyColleges />
          </TabsContent>
          
          <TabsContent value="career-paths" className="mt-6">
            <CareerPathVisualizations />
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-6">
            <NotificationCenter />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
