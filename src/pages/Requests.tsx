import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle, XCircle, MessageSquare, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, ServiceRequest } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/layout/BottomNavigation';

const Requests: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await apiService.getRequests();
      setRequests(data.requests);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'accepted' | 'declined') => {
    try {
      await apiService.updateRequestStatus(requestId, action);
      await loadRequests(); // Reload requests
      toast({
        title: 'Success',
        description: `Request ${action} successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action.slice(0, -2)} request`,
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'declined':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'accepted':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'declined':
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const filteredRequests = requests.filter(request => {
    switch (activeTab) {
      case 'pending':
        return request.status === 'pending';
      case 'active':
        return ['accepted'].includes(request.status);
      case 'completed':
        return ['completed', 'declined', 'cancelled'].includes(request.status);
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-4 py-6 max-w-md">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="bg-gradient-secondary rounded-xl p-6 text-white mb-6">
          <h1 className="text-xl font-bold mb-2">Service Requests</h1>
          <p className="text-white/90">
            {user?.role === 'customer' 
              ? 'Track your service requests' 
              : 'Manage incoming requests'
            }
          </p>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {requests.filter(r => r.status === 'pending').length}
              </p>
              <p className="text-sm text-white/80">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {requests.filter(r => r.status === 'accepted').length}
              </p>
              <p className="text-sm text-white/80">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {requests.filter(r => r.status === 'completed').length}
              </p>
              <p className="text-sm text-white/80">Completed</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Done</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No requests found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {user?.role === 'customer' 
                    ? 'Start by browsing services and making requests'
                    : 'Requests will appear here when customers contact you'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{request.service.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {user?.role === 'customer' 
                          ? `Provider: ${request.provider.name}`
                          : `Customer: ${request.customer.name}`
                        }
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                      {getStatusIcon(request.status)}
                      {request.status}
                    </Badge>
                  </div>

                  {request.message && (
                    <div className="bg-muted/50 rounded-lg p-3 mb-3">
                      <p className="text-sm">{request.message}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(request.requested_date).toLocaleDateString()}
                      </span>
                    </div>
                    {request.estimated_duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{request.estimated_duration}h estimated</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons for Providers */}
                  {user?.role === 'provider' && request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRequestAction(request.id, 'declined')}
                        className="flex-1"
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRequestAction(request.id, 'accepted')}
                        className="flex-1 bg-secondary hover:bg-secondary/90"
                      >
                        Accept
                      </Button>
                    </div>
                  )}

                  {/* Contact Button for Customers */}
                  {user?.role === 'customer' && ['accepted', 'pending'].includes(request.status) && (
                    <Button variant="outline" size="sm" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Provider
                    </Button>
                  )}

                  {/* Feedback Button for Completed Requests */}
                  {user?.role === 'customer' && request.status === 'completed' && (
                    <Button variant="gradient" size="sm" className="w-full">
                      Leave Feedback
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Requests;