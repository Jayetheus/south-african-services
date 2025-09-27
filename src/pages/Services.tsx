import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Star, MapPin, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, Service, Category } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/layout/BottomNavigation';

const Services: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [servicesData, categoriesData] = await Promise.all([
        apiService.getServices({
          category: selectedCategory || undefined,
          search: searchTerm || undefined,
        }),
        apiService.getCategories(),
      ]);
      setServices(servicesData.services);
      setCategories(categoriesData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load services',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? '' : categoryId);
  };

  const handleRequestService = async (serviceId: string) => {
    try {
      // For now, just show a toast. In a full implementation, 
      // this would open a request modal
      toast({
        title: 'Request Service',
        description: 'Service request feature will be implemented',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create request',
        variant: 'destructive',
      });
    }
  };

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
        <div className="bg-gradient-primary rounded-xl p-6 text-white mb-6">
          <h1 className="text-xl font-bold mb-2">Browse Services</h1>
          <p className="text-white/90">Find trusted local services in your area</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex-shrink-0"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryFilter(category.id)}
              className="flex-shrink-0"
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Add Service Button (Providers only) */}
        {user?.role === 'provider' && (
          <Button className="w-full mb-6 h-12 gap-2">
            <Plus className="h-5 w-5" />
            Add New Service
          </Button>
        )}

        {/* Services List */}
        <div className="space-y-4">
          {services.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No services found</p>
              </CardContent>
            </Card>
          ) : (
            services.map((service) => (
              <Card key={service.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {service.images[0] && (
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <img 
                          src={service.images[0]} 
                          alt={service.title}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = '🔧';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium truncate">{service.title}</h3>
                          <p className="text-sm text-muted-foreground">{service.provider.name}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {service.category.name}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current text-yellow-400" />
                          <span>{service.rating.toFixed(1)}</span>
                          <span>({service.review_count})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{service.location}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-primary">
                          R{service.price}/{service.price_type === 'hourly' ? 'hour' : 'fixed'}
                        </p>
                        {user?.role === 'customer' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleRequestService(service.id)}
                            className="h-7 text-xs"
                          >
                            Request
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
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

export default Services;