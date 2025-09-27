import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus, 
  MessageSquare, 
  Star,
  Calendar,
  User,
  MapPin,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { ServiceRequest } from '@/types/service';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Helper function to convert API request to legacy format for compatibility
const convertRequestToLegacy = (request: ServiceRequest): any => ({
  id: request.id,
  serviceId: request.service.id,
  customerId: request.customer.id,
  providerId: request.provider.id,
  status: request.status === 'declined' ? 'cancelled' : request.status,
  scheduledDate: request.requested_date || '',
  description: request.message || '',
  estimatedPrice: 0, // Not available in new API
  finalPrice: undefined,
  createdAt: request.created_at,
  updatedAt: request.updated_at
});

const Requests: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Load requests on component mount
  useEffect(() => {
    const loadRequests = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getRequests();
        
        if (response.success && response.data) {
          setRequests(response.data.data);
        }
      } catch (error) {
        console.error('Error loading requests:', error);
        toast({
          title: 'Error loading requests',
          description: 'Failed to load your service requests. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, [toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'accepted':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in_progress':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
      case 'declined':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={14} />;
      case 'accepted':
      case 'in_progress':
        return <Clock size={14} />;
      case 'completed':
        return <CheckCircle size={14} />;
      case 'cancelled':
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const activeRequests = requests.filter(r => 
    ['pending', 'accepted', 'in_progress'].includes(r.status)
  );
  
  const completedRequests = requests.filter(r => 
    ['completed', 'cancelled', 'declined'].includes(r.status)
  );

  const filteredRequests = activeTab === 'all' ? requests : 
    activeTab === 'active' ? activeRequests : completedRequests;

  const RequestCard = ({ request }: { request: ServiceRequest }) => (
    <Card className="border-0 bg-card/50 hover:shadow-card transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                {getStatusIcon(request.status)}
                <span className="ml-1">{formatStatus(request.status)}</span>
              </Badge>
            </div>
            
            <h3 className="font-medium text-foreground mb-1">
              {request.service.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {request.message || 'No message provided'}
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {request.requested_date && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar size={14} />
                <span>Requested: {formatDate(request.requested_date)}</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-muted-foreground">
              <User size={14} />
              <span>Provider: {request.provider.name}</span>
            </div>
            {request.estimated_duration && (
              <div className="font-medium text-primary">
                {request.estimated_duration}h estimated
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1">
            <MessageSquare size={14} className="mr-1" />
            Message
          </Button>
          
          {request.status === 'completed' && (
            <Button size="sm" className="flex-1">
              <Star size={14} className="mr-1" />
              Rate
            </Button>
          )}
          
          {request.status === 'pending' && (
            <Button size="sm" variant="destructive" className="flex-1">
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-4 pb-6">
        <div className="container mx-auto max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">My Requests</h1>
            <Button 
              size="sm"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <Plus size={16} className="mr-2" />
              New Request
            </Button>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-lg font-bold">{activeRequests.length}</div>
              <div className="text-xs text-white/80">Active</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-lg font-bold">{completedRequests.length}</div>
              <div className="text-xs text-white/80">Completed</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-lg font-bold">4.8</div>
              <div className="text-xs text-white/80">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Clock size={16} />
              Active ({activeRequests.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <CheckCircle size={16} />
              History ({completedRequests.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="border-0 bg-muted/30">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-6 bg-muted rounded animate-pulse" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                          <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                        </div>
                        <div className="flex gap-2">
                          <div className="h-8 bg-muted rounded animate-pulse flex-1" />
                          <div className="h-8 bg-muted rounded animate-pulse flex-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : activeRequests.length > 0 ? (
              activeRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <Card className="border-0 bg-muted/30">
                <CardContent className="p-8 text-center">
                  <Clock size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No active requests</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start by browsing services and making your first booking.
                  </p>
                  <Button className="bg-gradient-primary">
                    <Plus size={16} className="mr-2" />
                    Browse Services
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="border-0 bg-muted/30">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-6 bg-muted rounded animate-pulse" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                          <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                        </div>
                        <div className="flex gap-2">
                          <div className="h-8 bg-muted rounded animate-pulse flex-1" />
                          <div className="h-8 bg-muted rounded animate-pulse flex-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : completedRequests.length > 0 ? (
              completedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <Card className="border-0 bg-muted/30">
                <CardContent className="p-8 text-center">
                  <CheckCircle size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No completed requests</h3>
                  <p className="text-sm text-muted-foreground">
                    Your completed service requests will appear here.
                  </p>
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

export default Requests;