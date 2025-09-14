import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Bell, 
  Calendar, 
  GraduationCap, 
  DollarSign, 
  Trophy,
  FileText,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { 
  NotificationItem, 
  dashboardDB, 
  generateMockNotifications 
} from '@/services/dashboardDataService';
import { useProfileStore } from '@/stores/profileStore';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCardProps {
  notification: NotificationItem;
  onMarkAsRead?: (id: string) => void;
  onBookmark?: (id: string) => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'admission':
      return <GraduationCap className="w-5 h-5 text-blue-600" />;
    case 'scholarship':
      return <DollarSign className="w-5 h-5 text-green-600" />;
    case 'exam':
      return <FileText className="w-5 h-5 text-orange-600" />;
    case 'result':
      return <Trophy className="w-5 h-5 text-purple-600" />;
    case 'announcement':
      return <Bell className="w-5 h-5 text-gray-600" />;
    default:
      return <Bell className="w-5 h-5 text-gray-600" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'admission':
      return 'text-blue-600 bg-blue-50';
    case 'scholarship':
      return 'text-green-600 bg-green-50';
    case 'exam':
      return 'text-orange-600 bg-orange-50';
    case 'result':
      return 'text-purple-600 bg-purple-50';
    case 'announcement':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-50';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50';
    case 'low':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

const NotificationCard = ({ notification, onMarkAsRead, onBookmark }: NotificationCardProps) => {
  const isExpired = notification.deadline && new Date(notification.deadline) < new Date();
  const isUrgent = notification.deadline && 
    new Date(notification.deadline).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${!notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''} ${isExpired ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`${getNotificationColor(notification.type)} text-xs capitalize`}>
                  {notification.type}
                </Badge>
                <Badge className={`${getPriorityColor(notification.priority)} text-xs capitalize`}>
                  {notification.priority}
                </Badge>
                {isUrgent && !isExpired && (
                  <Badge className="text-red-600 bg-red-50 text-xs animate-pulse">
                    Urgent
                  </Badge>
                )}
                {isExpired && (
                  <Badge className="text-gray-600 bg-gray-50 text-xs">
                    Expired
                  </Badge>
                )}
              </div>
              <CardTitle className={`text-lg font-semibold leading-tight ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                {notification.title}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {notification.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* For now, we'll use a simple bookmark state - could be enhanced to store in database */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onBookmark?.(notification.id)}
              className="h-8 w-8 p-0"
            >
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Timeline Info */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatDistanceToNow(new Date(notification.date), { addSuffix: true })}</span>
            </div>
            {notification.deadline && (
              <div className={`flex items-center gap-2 ${isExpired ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-green-600'}`}>
                <Calendar className="w-4 h-4" />
                <span>Due: {new Date(notification.deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {notification.tags && notification.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {notification.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {notification.tags.length > 3 && (
                <Badge variant="outline" className="text-xs text-gray-500">
                  +{notification.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            {!notification.isRead && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onMarkAsRead?.(notification.id)}
                className="text-xs"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Mark as Read
              </Button>
            )}
            {notification.actionUrl && (
              <Button size="sm" className="text-xs">
                <ExternalLink className="w-3 h-3 mr-1" />
                Take Action
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i} className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Skeleton className="w-5 h-5 rounded" />
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
            <Skeleton className="w-8 h-8" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);

export const NotificationCenterDashboard = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const { currentProfile } = useProfileStore();

  useEffect(() => {
    loadNotifications();
  }, [currentProfile]);

  useEffect(() => {
    filterNotifications();
  }, [notifications, searchTerm, selectedType, showUnreadOnly]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to get cached notifications first
      let cachedNotifications = await dashboardDB.getNotifications();
      
      // If no cached data, generate new ones
      if (cachedNotifications.length === 0) {
        const mockNotifications = generateMockNotifications();
        await dashboardDB.saveNotifications(mockNotifications);
        await dashboardDB.setCacheTimestamp('notifications', Date.now());
        cachedNotifications = mockNotifications;
      }

      // Sort by date (newest first)
      const sortedNotifications = cachedNotifications.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setNotifications(sortedNotifications);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (notification.tags && notification.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(notification => notification.type === selectedType);
    }

    // Filter by read status
    if (showUnreadOnly) {
      filtered = filtered.filter(notification => !notification.isRead);
    }

    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const updatedNotifications = notifications.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      );
      setNotifications(updatedNotifications);
      await dashboardDB.saveNotifications(updatedNotifications);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleBookmark = async (id: string) => {
    // Simple bookmark toggle - in a real app, this would be stored in the database
    console.log('Bookmark toggled for notification:', id);
  };

  const markAllAsRead = async () => {
    try {
      const updatedNotifications = notifications.map(notification => 
        ({ ...notification, isRead: true })
      );
      setNotifications(updatedNotifications);
      await dashboardDB.saveNotifications(updatedNotifications);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => 
    n.deadline && 
    new Date(n.deadline).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000 &&
    new Date(n.deadline) > new Date()
  ).length;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error}. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            Notification Center
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white text-xs">
                {unreadCount}
              </Badge>
            )}
          </h3>
          <p className="text-sm text-gray-600">
            Stay updated with admissions, scholarships, and exam announcements
          </p>
        </div>
        <div className="flex items-center gap-2">
          {urgentCount > 0 && (
            <Badge className="bg-orange-500 text-white text-sm animate-pulse">
              {urgentCount} Urgent
            </Badge>
          )}
          {unreadCount > 0 && (
            <Button size="sm" onClick={markAllAsRead}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <TabsList className="grid w-full max-w-2xl grid-cols-6">
            <TabsTrigger value="all" onClick={() => setSelectedType('all')}>
              All ({filteredNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="admission" onClick={() => setSelectedType('admission')}>
              Admissions
            </TabsTrigger>
            <TabsTrigger value="scholarship" onClick={() => setSelectedType('scholarship')}>
              Scholarships
            </TabsTrigger>
            <TabsTrigger value="exam" onClick={() => setSelectedType('exam')}>
              Exams
            </TabsTrigger>
            <TabsTrigger value="result" onClick={() => setSelectedType('result')}>
              Results
            </TabsTrigger>
            <TabsTrigger value="announcement" onClick={() => setSelectedType('announcement')}>
              News
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-1 gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showUnreadOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className="whitespace-nowrap"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showUnreadOnly ? 'Show All' : 'Unread Only'}
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          {filteredNotifications.length === 0 ? (
            <Alert className="border-blue-200 bg-blue-50">
              <Bell className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                {searchTerm || selectedType !== 'all' || showUnreadOnly
                  ? 'No notifications match your current filters.'
                  : 'No notifications available. Check back later for updates.'}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onBookmark={handleBookmark}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
