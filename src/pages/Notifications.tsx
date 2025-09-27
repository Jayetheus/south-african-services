import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Star,
  Info,
  Trash2,
  MailOpen
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'request' | 'acceptance' | 'decline' | 'completion' | 'feedback' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Mock notifications data - in real app, this would come from API
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockNotifications: Notification[] = [
          {
            id: '1',
            type: 'request',
            title: 'New Service Request',
            message: 'John Doe requested your plumbing services for bathroom repair.',
            isRead: false,
            createdAt: '2024-01-15T10:30:00Z',
            data: { requestId: 'req_123', customerName: 'John Doe' }
          },
          {
            id: '2',
            type: 'acceptance',
            title: 'Request Accepted',
            message: 'Your request for electrical services has been accepted by Mike Johnson.',
            isRead: false,
            createdAt: '2024-01-15T09:15:00Z',
            data: { requestId: 'req_124', providerName: 'Mike Johnson' }
          },
          {
            id: '3',
            type: 'completion',
            title: 'Service Completed',
            message: 'Your cleaning service has been completed. Please rate your experience.',
            isRead: true,
            createdAt: '2024-01-14T16:45:00Z',
            data: { requestId: 'req_125', serviceName: 'House Cleaning' }
          },
          {
            id: '4',
            type: 'feedback',
            title: 'New Review',
            message: 'You received a 5-star review from Sarah Wilson for your gardening services.',
            isRead: true,
            createdAt: '2024-01-14T14:20:00Z',
            data: { rating: 5, customerName: 'Sarah Wilson' }
          },
          {
            id: '5',
            type: 'system',
            title: 'Account Verification',
            message: 'Your account verification is complete. You can now offer services.',
            isRead: true,
            createdAt: '2024-01-13T11:00:00Z'
          },
          {
            id: '6',
            type: 'decline',
            title: 'Request Declined',
            message: 'Your request for painting services was declined by the provider.',
            isRead: false,
            createdAt: '2024-01-13T08:30:00Z',
            data: { requestId: 'req_126', reason: 'Not available' }
          }
        ];
        
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
        toast({
          title: 'Error loading notifications',
          description: 'Failed to load notifications. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [toast]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'request':
        return <MessageSquare size={16} className="text-blue-500" />;
      case 'acceptance':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'decline':
        return <XCircle size={16} className="text-red-500" />;
      case 'completion':
        return <Star size={16} className="text-yellow-500" />;
      case 'feedback':
        return <Star size={16} className="text-purple-500" />;
      case 'system':
        return <Info size={16} className="text-gray-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'request':
        return 'border-l-blue-500';
      case 'acceptance':
        return 'border-l-green-500';
      case 'decline':
        return 'border-l-red-500';
      case 'completion':
        return 'border-l-yellow-500';
      case 'feedback':
        return 'border-l-purple-500';
      case 'system':
        return 'border-l-gray-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    toast({
      title: 'All notifications marked as read',
      description: 'All notifications have been marked as read.',
    });
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    toast({
      title: 'Notification deleted',
      description: 'Notification has been deleted.',
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.isRead;
    return notification.type === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-4 pb-6">
        <div className="container mx-auto max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="bg-white/20 text-white border-white/30">
                {unreadCount} new
              </Badge>
            )}
          </div>
          
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <MailOpen size={16} className="mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="request">Requests</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Card key={index} className="border-0 bg-muted/30">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded animate-pulse" />
                            <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`border-0 bg-card/50 border-l-4 ${getNotificationColor(notification.type)} ${
                    !notification.isRead ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground mb-1">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-1 ml-2">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-8 w-8 p-0"
                              >
                                <CheckCircle size={14} />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-0 bg-muted/30">
                <CardContent className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <Bell size={48} className="mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No notifications</h3>
                    <p className="text-sm">
                      {activeTab === 'unread' 
                        ? 'You have no unread notifications.' 
                        : 'You have no notifications yet.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Notifications;
