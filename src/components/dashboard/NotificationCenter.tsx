import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Calendar, 
  ExternalLink, 
  GraduationCap, 
  DollarSign, 
  BookOpen, 
  Megaphone,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  X
} from 'lucide-react';
import { useNotifications, useMarkNotificationAsRead, useUnreadNotificationCount } from '@/services/dashboardService';
import { Notification } from '@/services/dashboardDatabase';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationCard = ({ notification, onMarkAsRead }: NotificationCardProps) => {
  const getTypeIcon = (type: Notification['type']) => {
    const icons = {
      'admission': <GraduationCap className="w-4 h-4" />,
      'scholarship': <DollarSign className="w-4 h-4" />,
      'exam': <BookOpen className="w-4 h-4" />,
      'announcement': <Megaphone className="w-4 h-4" />
    };
    return icons[type];
  };

  const getTypeColor = (type: Notification['type']) => {
    const colors = {
      'admission': 'bg-blue-100 text-blue-800 border-blue-200',
      'scholarship': 'bg-green-100 text-green-800 border-green-200',
      'exam': 'bg-purple-100 text-purple-800 border-purple-200',
      'announcement': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[type];
  };

  const getPriorityIcon = (priority: Notification['priority']) => {
    const icons = {
      'high': <AlertTriangle className="w-3 h-3 text-red-500" />,
      'medium': <Info className="w-3 h-3 text-yellow-500" />,
      'low': <CheckCircle className="w-3 h-3 text-gray-500" />
    };
    return icons[priority];
  };

  const isExpired = notification.deadline && new Date(notification.deadline) < new Date();
  const daysUntilDeadline = notification.deadline 
    ? Math.ceil((new Date(notification.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      !notification.isRead ? 'ring-1 ring-blue-200 bg-blue-50/50' : ''
    } ${isExpired ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`text-xs px-2 py-1 ${getTypeColor(notification.type)}`}>
                <span className="flex items-center gap-1">
                  {getTypeIcon(notification.type)}
                  {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                </span>
              </Badge>
              {getPriorityIcon(notification.priority)}
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </div>
            <CardTitle className="text-base font-semibold text-gray-900 leading-tight">
              {notification.title}
            </CardTitle>
          </div>
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkAsRead(notification.id)}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {notification.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
            </div>
            {notification.deadline && (
              <div className={`flex items-center gap-1 ${
                isExpired ? 'text-red-600' : 
                daysUntilDeadline && daysUntilDeadline <= 7 ? 'text-yellow-600' : 'text-gray-500'
              }`}>
                <Calendar className="w-3 h-3" />
                <span>
                  {isExpired 
                    ? 'Expired'
                    : daysUntilDeadline === 0 
                    ? 'Today' 
                    : daysUntilDeadline === 1
                    ? '1 day left'
                    : `${daysUntilDeadline} days left`
                  }
                </span>
              </div>
            )}
          </div>
          
          {notification.actionUrl && !isExpired && (
            <Button variant="outline" size="sm" asChild>
              <a 
                href={notification.actionUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs"
              >
                View Details
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const NotificationSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-3" />
          </div>
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-6 w-6" />
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="flex justify-between">
        <div className="flex gap-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
    </CardContent>
  </Card>
);

interface NotificationStatsProps {
  notifications: Notification[];
  unreadCount: number;
}

const NotificationStats = ({ notifications, unreadCount }: NotificationStatsProps) => {
  const stats = {
    total: notifications.length,
    unread: unreadCount,
    byType: notifications.reduce((acc, notif) => {
      acc[notif.type] = (acc[notif.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    urgent: notifications.filter(n => n.priority === 'high' && !n.isRead).length,
    expiringSoon: notifications.filter(n => 
      n.deadline && 
      new Date(n.deadline) > new Date() && 
      new Date(n.deadline).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000
    ).length
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="text-center">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
          <p className="text-sm text-gray-600">Unread</p>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
          <p className="text-sm text-gray-600">Urgent</p>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</div>
          <p className="text-sm text-gray-600">Expiring Soon</p>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <p className="text-sm text-gray-600">Total</p>
        </CardContent>
      </Card>
    </div>
  );
};

export const NotificationCenter = () => {
  const [activeTab, setActiveTab] = useState('all');
  const { data: notifications = [], isLoading, error, isError } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markAsReadMutation = useMarkNotificationAsRead();

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const filterNotifications = (type: string) => {
    switch (type) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'admission':
      case 'scholarship':
      case 'exam':
      case 'announcement':
        return notifications.filter(n => n.type === type);
      default:
        return notifications;
    }
  };

  const filteredNotifications = filterNotifications(activeTab);

  if (isError) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            Unable to load notifications. {error instanceof Error ? error.message : 'Please try again later.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-600 mt-1">
            Stay updated with admissions, scholarships, and exam announcements
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Bell className="w-4 h-4" />
          <span>{unreadCount} unread</span>
        </div>
      </div>

      {!isLoading && notifications.length > 0 && (
        <NotificationStats notifications={notifications} unreadCount={unreadCount} />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="admission">Admissions</TabsTrigger>
          <TabsTrigger value="scholarship">Scholarships</TabsTrigger>
          <TabsTrigger value="exam">Exams</TabsTrigger>
          <TabsTrigger value="announcement">News</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {isLoading ? (
            Array.from({ length: 5 }, (_, i) => (
              <NotificationSkeleton key={i} />
            ))
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationCard 
                key={notification.id} 
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          ) : (
            <Alert>
              <AlertDescription>
                {activeTab === 'all' 
                  ? 'No notifications available.'
                  : `No ${activeTab === 'unread' ? 'unread' : activeTab} notifications.`
                }
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
