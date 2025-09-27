import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Bell, 
  MapPin, 
  TrendingUp, 
  Clock, 
  Star, 
  Loader2,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  DollarSign,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/layout/BottomNavigation';
import ServiceFormModal from '@/components/services/ServiceFormModal';
import { Service, ServiceCategory, ServiceRequest } from '@/types/service';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-sa-services.jpg';

// Helper function to convert API service to legacy format for ServiceCard compatibility
const convertServiceToLegacy = (service: Service): any => ({
  id: service.id,
  title: service.title,
  description: service.description,
  category: service.category.name,
  providerId: service.provider.id,
  providerName: service.provider.name,
  providerImage: service.provider.avatar_url,
  price: service.price,
  priceType: service.price_type === 'hourly' ? 'hourly' : service.price_type === 'fixed' ? 'fixed' : 'per_item',
  rating: service.rating,
  reviewCount: service.review_count,
  location: service.location,
  images: service.images,
  availability: service.is_active ? 'available' : 'unavailable',
  responseTime: '2 hours',
  verified: service.provider.is_verified,
  tags: [],
  createdAt: service.created_at
});

const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myServices, setMyServices] = useState<Service[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateService, setShowCreateService] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load provider data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load provider's services, requests, and categories in parallel
        const [servicesResponse, requestsResponse, categoriesResponse] = await Promise.all([
          apiClient.getServices({ page: 1, limit: 20 }), // This should be filtered by provider in real API
          apiClient.getRequests(),
          apiClient.getCategories()
        ]);

        if (servicesResponse.success && servicesResponse.data) {
          // Filter services by current provider (in real API, this would be done server-side)
          const providerServices = servicesResponse.data.data.filter(
            service => service.provider.id === user?.id
          );
          setMyServices(providerServices);
        }

        if (requestsResponse.success && requestsResponse.data) {
          // Filter requests for this provider
          const providerRequests = requestsResponse.data.data.filter(
            request => request.provider.id === user?.id
          );
          setServiceRequests(providerRequests);
        }

        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
      } catch (error) {
        console.error('Error loading provider data:', error);
        toast({
          title: 'Error loading data',
          description: 'Failed to load your dashboard data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id, toast]);

  // Calculate provider statistics
  const stats = {
    totalServices: myServices.length,
    activeRequests: serviceRequests.filter(r => ['pending', 'accepted'].includes(r.status)).length,
    completedJobs: serviceRequests.filter(r => r.status === 'completed').length,
    averageRating: myServices.length > 0 ? 
      (myServices.reduce((sum, service) => sum + service.rating, 0) / myServices.length).toFixed(1) : '0.0',
    totalEarnings: serviceRequests
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + (r.service?.price || 0), 0)
  };

  // Handle service creation
  const handleCreateService = async (serviceData: any) => {
    try {
      setIsSubmitting(true);
      const response = await apiClient.createService(serviceData);
      if (response.success && response.data) {
        setMyServices(prev => [response.data, ...prev]);
        setShowCreateService(false);
        toast({
          title: 'Service created',
          description: 'Your service has been created successfully.',
        });
      }
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: 'Error creating service',
        description: 'Failed to create service. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle service update
  const handleUpdateService = async (serviceData: any) => {
    try {
      setIsSubmitting(true);
      const response = await apiClient.updateService(editingService?.id!, serviceData);
      
      if (response.success && response.data) {
        setMyServices(prev => 
          prev.map(s => s.id === editingService?.id ? response.data : s)
        );
        
        toast({
          title: 'Service updated',
          description: 'Your service has been updated successfully.',
        });
        setEditingService(null);
      }
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: 'Error updating service',
        description: 'Failed to update service. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle service deletion
  const handleDeleteService = async (serviceId: string) => {
    try {
      const response = await apiClient.deleteService(serviceId);
      
      if (response.success) {
        setMyServices(prev => prev.filter(s => s.id !== serviceId));
        toast({
          title: 'Service deleted',
          description: 'Your service has been deleted successfully.',
        });
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Error deleting service',
        description: 'Failed to delete service. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle request status update
  const handleUpdateRequestStatus = async (requestId: string, status: string) => {
    try {
      const response = await apiClient.updateRequestStatus(requestId, status);
      if (response.success) {
        setServiceRequests(prev => 
          prev.map(r => r.id === requestId ? { ...r, status: status as any } : r)
        );
        toast({
          title: 'Request updated',
          description: `Request ${status} successfully.`,
        });
      }
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: 'Error updating request',
        description: 'Failed to update request status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'accepted':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'declined':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Provider Dashboard" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="container mx-auto max-w-md">
            <h1 className="text-2xl font-bold mb-2">Provider Dashboard</h1>
            <p className="text-white/90 text-sm mb-4">
              Manage your services and requests
            </p>
            
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <MapPin size={14} />
              <span>{user?.location || 'South Africa'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-md space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 bg-card/50">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 size={20} className="text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-foreground">{stats.totalServices}</p>
                <p className="text-xs text-muted-foreground">Services</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-card/50">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock size={20} className="text-orange-500" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-foreground">{stats.activeRequests}</p>
                <p className="text-xs text-muted-foreground">Active Requests</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-card/50">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle size={20} className="text-green-500" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-foreground">{stats.completedJobs}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-card/50">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center mb-2">
                <Star size={20} className="text-yellow-500" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-foreground">{stats.averageRating}</p>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Recent Requests */}
            <Card className="border-0 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">Recent Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                          <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : serviceRequests.slice(0, 3).length > 0 ? (
                  <div className="space-y-3">
                    {serviceRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <MessageSquare size={16} className="text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{request.service.title}</p>
                            <p className="text-xs text-muted-foreground">
                              From {request.customer.name}
                            </p>
                          </div>
                        </div>
                        <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                          {formatStatus(request.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent requests</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 bg-gradient-primary">
              <CardContent className="p-4">
                <div className="text-center text-white space-y-3">
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setShowCreateService(true)}
                      className="bg-white/20 text-white border-white/30 hover:bg-white/30 flex-1"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Service
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('requests')}
                      variant="outline"
                      className="bg-white/20 text-white border-white/30 hover:bg-white/30 flex-1"
                    >
                      <MessageSquare size={16} className="mr-2" />
                      View Requests
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">My Services</h2>
              <Button 
                onClick={() => setShowCreateService(true)}
                size="sm"
                className="bg-gradient-primary"
              >
                <Plus size={16} className="mr-2" />
                Add Service
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="border-0 bg-muted/30">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                        <div className="flex gap-2">
                          <div className="h-8 bg-muted rounded animate-pulse flex-1" />
                          <div className="h-8 bg-muted rounded animate-pulse flex-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : myServices.length > 0 ? (
              <div className="space-y-3">
                {myServices.map((service) => (
                  <Card key={service.id} className="border-0 bg-card/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground mb-1">
                            {service.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {service.category.name}
                            </Badge>
                            <span className="text-sm font-medium text-primary">
                              R{service.price}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingService(service)}
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 bg-muted/30">
                <CardContent className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No services yet</h3>
                    <p className="text-sm mb-4">
                      Start by creating your first service to get bookings.
                    </p>
                    <Button 
                      onClick={() => setShowCreateService(true)}
                      className="bg-gradient-primary"
                    >
                      <Plus size={16} className="mr-2" />
                      Create Service
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <h2 className="text-lg font-semibold">Service Requests</h2>
            
            {isLoading ? (
              <div className="space-y-3">
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
            ) : serviceRequests.length > 0 ? (
              <div className="space-y-3">
                {serviceRequests.map((request) => (
                  <Card key={request.id} className="border-0 bg-card/50">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                              {formatStatus(request.status)}
                            </Badge>
                          </div>
                          
                          <h3 className="font-medium text-foreground mb-1">
                            {request.service.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {request.message || 'No message provided'}
                          </p>
                          
                          <div className="flex items-center gap-1 text-muted-foreground text-sm mt-2">
                            <Users size={14} />
                            <span>From {request.customer.name}</span>
                          </div>
                        </div>
                      </div>

                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => handleUpdateRequestStatus(request.id, 'accepted')}
                            className="flex-1"
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Accept
                          </Button>
                          <Button 
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateRequestStatus(request.id, 'declined')}
                            className="flex-1"
                          >
                            <XCircle size={14} className="mr-1" />
                            Decline
                          </Button>
                        </div>
                      )}
                      
                      {request.status === 'accepted' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => handleUpdateRequestStatus(request.id, 'completed')}
                            className="flex-1"
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Mark Complete
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <MessageSquare size={14} className="mr-1" />
                            Message
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 bg-muted/30">
                <CardContent className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No requests yet</h3>
                    <p className="text-sm">
                      Service requests will appear here when customers book your services.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Service Form Modal */}
      <ServiceFormModal
        isOpen={showCreateService || !!editingService}
        onClose={() => {
          setShowCreateService(false);
          setEditingService(null);
        }}
        onSubmit={editingService ? handleUpdateService : handleCreateService}
        service={editingService}
        categories={categories}
        isLoading={isSubmitting}
      />

      <BottomNavigation />
    </div>
  );
};

export default ProviderDashboard;
