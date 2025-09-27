import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Bell, MapPin, TrendingUp, Clock, Star, Loader2, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/layout/BottomNavigation';
import ServiceCategories from '@/components/services/ServiceCategories';
import ServiceCard from '@/components/services/ServiceCard';
import { Service, ServiceCategory } from '@/types/service';
import { apiClient } from '@/lib/api';
import ProviderDashboard from './ProviderDashboard';
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
  responseTime: '2 hours', // Default response time
  verified: service.provider.is_verified,
  tags: [], // No tags in new API
  createdAt: service.created_at
});

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // If user is a provider, show provider dashboard
  if (user?.role === 'provider') {
    return <ProviderDashboard />;
  }

  // Customer dashboard
  const navigate = useNavigate();
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load featured services and categories on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load featured services (top rated) and categories in parallel
        const [servicesResponse, categoriesResponse] = await Promise.all([
          apiClient.getServices({ page: 1, limit: 6 }),
          apiClient.getCategories()
        ]);

        if (servicesResponse.success && servicesResponse.data) {
          setFeaturedServices(servicesResponse.data.data || []);
        }

        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const stats = [
    { title: 'Active Services', value: '2,450', icon: TrendingUp, change: '+12%' },
    { title: 'Avg Response', value: '2.5 hrs', icon: Clock, change: '-15%' },
    { title: 'Customer Rating', value: '4.8', icon: Star, change: '+0.2' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={heroImage} 
          alt="South African Services" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h1 className="text-lg font-semibold">Good morning,</h1>
              <p className="text-white/90">{user?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <Bell size={16} />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Search for services..."
                className="pl-10 bg-white/90 border-0 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <MapPin size={14} />
              <span>Cape Town, Western Cape</span>
              <Button variant="link" className="text-white/90 p-0 h-auto text-sm underline">
                Change location
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-md space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 bg-card/50">
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <stat.icon size={20} className="text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-xs text-green-600 font-medium">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Service Categories */}
        <ServiceCategories 
          categories={categories}
          compact={true} 
          isLoading={isLoading}
        />

        {/* Featured Services */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Featured Services</h2>
            <Button variant="link" className="text-primary p-0 h-auto text-sm">
              View All
            </Button>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="border-0 bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted rounded-lg animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                        <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {featuredServices.map((service) => (
                <ServiceCard 
                  key={service.id} 
                  service={convertServiceToLegacy(service)} 
                  compact={true} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="border-0 bg-gradient-primary">
          <CardContent className="p-4">
            <div className="text-center text-white space-y-3">
              <h3 className="text-lg font-semibold">Need help with something?</h3>
              <p className="text-white/90 text-sm">
                Post your service request and get quotes from verified providers
              </p>
              <Button 
                onClick={() => navigate('/create-request')}
                className="bg-white text-primary hover:bg-white/90 w-full"
                size="sm"
              >
                <Plus size={16} className="mr-2" />
                Post a Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Dashboard;