import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign,
  MessageSquare,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/layout/BottomNavigation';
import ServiceCard from '@/components/services/ServiceCard';
import { Service, ServiceCategory } from '@/types/service';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const CreateRequest: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [requestData, setRequestData] = useState({
    message: '',
    requestedDate: '',
    estimatedDuration: '',
    budget: '',
    location: user?.location || '',
    urgency: 'normal',
    specialRequirements: ''
  });

  // Load services and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const [servicesResponse, categoriesResponse] = await Promise.all([
          apiClient.getServices({ page: 1, limit: 20 }),
          apiClient.getCategories()
        ]);

        if (servicesResponse.success && servicesResponse.data) {
          setServices(servicesResponse.data.data);
        }

        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error loading data',
          description: 'Failed to load services. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Handle service selection
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setRequestData(prev => ({
      ...prev,
      budget: service.price.toString(),
      location: service.location
    }));
  };

  // Handle search
  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getServices({
        search: searchTerm,
        category: selectedCategory,
        page: 1,
        limit: 20
      });

      if (response.success && response.data) {
        setServices(response.data.data);
      }
    } catch (error) {
      console.error('Error searching services:', error);
      toast({
        title: 'Search failed',
        description: 'Failed to search services. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle request submission
  const handleSubmitRequest = async () => {
    if (!selectedService) {
      toast({
        title: 'No service selected',
        description: 'Please select a service before submitting your request.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const requestPayload = {
        service_id: selectedService.id,
        message: requestData.message,
        requested_date: requestData.requestedDate,
        estimated_duration: parseInt(requestData.estimatedDuration) || 1
      };

      const response = await apiClient.createRequest(requestPayload);
      
      if (response.success) {
        toast({
          title: 'Request sent',
          description: 'Your service request has been sent successfully.',
        });
        navigate('/requests');
      }
    } catch (error) {
      console.error('Error creating request:', error);
      toast({
        title: 'Error sending request',
        description: 'Failed to send service request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert service to legacy format for ServiceCard
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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-4 pb-6">
        <div className="container mx-auto max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20 p-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-bold">Create Request</h1>
          </div>
          
          {/* Search */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Search for services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/90 border-0 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white/90 border-0 text-foreground">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleSearch}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-md space-y-6">
        {/* Selected Service */}
        {selectedService && (
          <Card className="border-0 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" />
                Selected Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  📷
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{selectedService.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {selectedService.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {selectedService.category.name}
                    </Badge>
                    <span className="text-sm font-medium text-primary">
                      R{selectedService.price}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedService(null)}
                >
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Selection */}
        {!selectedService && (
          <Card className="border-0 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Choose a Service</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted rounded-lg animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : services.length > 0 ? (
                <div className="space-y-3">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        📷
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{service.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {service.category.name}
                          </Badge>
                          <span className="text-sm font-medium text-primary">
                            R{service.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No services found</p>
                  <p className="text-xs">Try adjusting your search terms</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Request Details */}
        {selectedService && (
          <Card className="border-0 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Describe what you need *</Label>
                <Textarea
                  id="message"
                  value={requestData.message}
                  onChange={(e) => setRequestData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Describe the work you need done..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requestedDate">Preferred Date</Label>
                  <Input
                    id="requestedDate"
                    type="date"
                    value={requestData.requestedDate}
                    onChange={(e) => setRequestData(prev => ({ ...prev, requestedDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedDuration">Duration (hours)</Label>
                  <Input
                    id="estimatedDuration"
                    type="number"
                    value={requestData.estimatedDuration}
                    onChange={(e) => setRequestData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                    placeholder="2"
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget (R)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={requestData.budget}
                  onChange={(e) => setRequestData(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="500"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Service Location</Label>
                <Input
                  id="location"
                  value={requestData.location}
                  onChange={(e) => setRequestData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter your address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency</Label>
                <Select
                  value={requestData.urgency}
                  onValueChange={(value) => setRequestData(prev => ({ ...prev, urgency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Within a month</SelectItem>
                    <SelectItem value="normal">Normal - Within 2 weeks</SelectItem>
                    <SelectItem value="high">High - Within a week</SelectItem>
                    <SelectItem value="urgent">Urgent - ASAP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequirements">Special Requirements</Label>
                <Textarea
                  id="specialRequirements"
                  value={requestData.specialRequirements}
                  onChange={(e) => setRequestData(prev => ({ ...prev, specialRequirements: e.target.value }))}
                  placeholder="Any special requirements or notes..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        {selectedService && (
          <Button
            onClick={handleSubmitRequest}
            disabled={isSubmitting || !requestData.message}
            className="w-full bg-gradient-primary"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Sending Request...
              </>
            ) : (
              <>
                <MessageSquare size={16} className="mr-2" />
                Send Request
              </>
            )}
          </Button>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default CreateRequest;
