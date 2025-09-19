import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  AlertCircle,
  LogOut,
  GraduationCap,
  Globe
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
  const { t } = useTranslation();
  
  if (isOnline) return null;

  return (
    <Alert className="border-orange-200 bg-orange-50 mb-6">
      <WifiOff className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-orange-700">
          {t('dashboard.offline')}
        </span>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-3 h-3 mr-1" />
            {t('dashboard.retry')}
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

const DashboardStats = ({ unreadCount, isOnline }: DashboardStatsProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('dashboard.stats.stream_match')}</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">95%</div>
          <p className="text-xs text-muted-foreground">CS & Engineering</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('dashboard.stats.nearby_colleges')}</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">24</div>
          <p className="text-xs text-muted-foreground">{t('dashboard.stats.within_km')}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('dashboard.stats.notifications')}</CardTitle>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
          <p className="text-xs text-muted-foreground">{t('dashboard.stats.unread_alerts')}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('dashboard.stats.connection')}</CardTitle>
          {isOnline ? 
            <Wifi className="h-4 w-4 text-green-500" /> : 
            <WifiOff className="h-4 w-4 text-red-500" />
          }
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
            {isOnline ? t('dashboard.stats.online') : t('dashboard.stats.offline')}
          </div>
          <p className="text-xs text-muted-foreground">
            {isOnline ? t('dashboard.stats.real_time') : t('dashboard.stats.cached_data')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

interface QuickActionsProps {
  onViewProfile: () => void;
  onOpenSettings: () => void;
}

const QuickActions = ({ onViewProfile, onOpenSettings }: QuickActionsProps) => {
  const { t } = useTranslation();
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">{t('dashboard.quick_actions.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={onViewProfile}>
            <User className="w-4 h-4 mr-2" />
            {t('dashboard.quick_actions.view_profile')}
          </Button>
          <Button variant="outline" onClick={onOpenSettings}>
            <Settings className="w-4 h-4 mr-2" />
            {t('dashboard.quick_actions.settings')}
          </Button>
          <Button variant="outline">
            <BookOpen className="w-4 h-4 mr-2" />
            {t('dashboard.quick_actions.take_assessment')}
          </Button>
          <Button variant="outline">
            <MapPin className="w-4 h-4 mr-2" />
            {t('dashboard.quick_actions.find_colleges')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  // Debug: Log successful dashboard render
  console.log('Dashboard component rendered successfully!');
  console.log('User:', user);
  console.log('Current path:', location.pathname);
  console.log('Current language:', currentLanguage);
  console.log('i18n language:', i18n.language);
  
  if (!user) {
    console.log('Dashboard: No user found, rendering null');
    return <div style={{backgroundColor: 'red', color: 'white', padding: '20px'}}>
      NO USER - This should not show if you're logged in
    </div>;
  }

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };
  
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

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{backgroundColor: 'red', padding: '20px', fontSize: '24px', color: 'white', border: '5px solid black'}}>
        TEST: Dashboard is rendering! User: {user?.name}
        <br/>
        Current Language: {currentLanguage}
      </div>

      {/* Debug Information Panel */}

      {/* Debug Information Panel */}
      {showDebugInfo && (
        <Alert className="m-4 border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold text-green-800">DEBUG: Dashboard Loaded Successfully!</div>
            <div className="text-sm text-green-700 mt-1">
              <div>User: {user?.name} ({user?.email})</div>
              <div>Current Path: {location.pathname}</div>
              <div>Timestamp: {new Date().toLocaleString()}</div>
              <button 
                onClick={() => setShowDebugInfo(false)}
                className="text-xs underline mt-2"
              >
                Hide Debug Info
              </button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <LayoutDashboard className="w-8 h-8 text-blue-600" />
                {t('dashboard.title')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('dashboard.subtitle')}
              </p>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <Badge variant="outline" className="text-sm px-3 py-1 hidden md:block">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Badge>
              
              {/* Language Switcher */}
              <div className="flex items-center">
                <Select value={currentLanguage} onValueChange={changeLanguage}>
                  <SelectTrigger className="w-32 md:w-40 border-2 border-blue-300 bg-white">
                    <Globe className="mr-2 h-4 w-4 text-blue-600" />
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t('languages.english')}</SelectItem>
                    <SelectItem value="hi">{t('languages.hindi')}</SelectItem>
                    <SelectItem value="ur">{t('languages.urdu')}</SelectItem>
                    <SelectItem value="ks">{t('languages.kashmiri')}</SelectItem>
                    <SelectItem value="dg">{t('languages.dogri')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                {user?.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.name}
                    className="w-6 h-6 md:w-8 md:h-8 rounded-full"
                  />
                ) : (
                  <User className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                )}
                <span className="text-sm font-medium hidden md:inline">{user?.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/profile')} className="hidden md:flex">
                <Settings className="mr-2 h-4 w-4" />
                {t('dashboard.profile')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">{t('dashboard.sign_out')}</span>
                <LogOut className="h-4 w-4 md:hidden" />
              </Button>
            </div>
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
            <TabsTrigger value="overview">{t('dashboard.tabs.overview')}</TabsTrigger>
            <TabsTrigger value="colleges">{t('dashboard.tabs.colleges')}</TabsTrigger>
            <TabsTrigger value="career-paths">{t('dashboard.tabs.career_paths')}</TabsTrigger>
            <TabsTrigger value="notifications" className="relative">
              {t('dashboard.tabs.notifications')}
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
                <h3 className="text-lg font-semibold mb-4">{t('dashboard.recent_notifications')}</h3>
                <div className="space-y-4">
                  <NotificationCenter />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('dashboard.career_insights')}</h3>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center space-y-2">
                      <TrendingUp className="w-12 h-12 text-blue-500 mx-auto" />
                      <h4 className="font-semibold">{t('dashboard.career_growth')}</h4>
                      <p className="text-sm text-gray-600">
                        {t('dashboard.growth_description')}
                      </p>
                      <Button variant="outline" size="sm">
                        {t('dashboard.view_full_analysis')}
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
