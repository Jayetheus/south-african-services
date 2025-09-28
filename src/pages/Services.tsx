import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, SlidersHorizontal, AlertTriangle, Loader2 } from 'lucide-react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import ServiceCategories from '@/components/services/ServiceCategories';
import ServiceCard from '@/components/services/ServiceCard';
import { Service, ServiceCategory } from '@/types/service';
import { searchQuerySchema, searchRateLimiter, SecurityUtils, sanitizeText } from '@/lib/security';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';

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

const Services: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchError, setSearchError] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Load services and categories on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load services and categories in parallel
        const [servicesResponse, categoriesResponse] = await Promise.all([
          api.getServices({ page: 1, limit: 20 }),
          api.getCategories()
        ]);

        setServices(servicesResponse.services);
        setPagination(servicesResponse.pagination);
        setCategories(categoriesResponse);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error loading services',
          description: 'Failed to load services. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Load services with filters
  const loadServices = useCallback(async (filters: {
    search?: string;
    category?: string;
    page?: number;
    sortBy?: string;
  } = {}) => {
    try {
      setIsLoading(true);
      
      const params: any = {
        page: filters.page || 1,
        limit: 20
      };

      if (filters.search) {
        params.search = filters.search;
      }

      if (filters.category) {
        params.category = filters.category;
      }

      const response = await api.getServices(params);
      
      setServices(response.services);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error loading services:', error);
      toast({
        title: 'Error loading services',
        description: 'Failed to load services. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Secure search with rate limiting and validation
  const handleSearch = useCallback((query: string) => {
    // Reset previous errors
    setSearchError('');

    // Check rate limiting
    if (!searchRateLimiter.isAllowed('search')) {
      const timeRemaining = searchRateLimiter.getBlockedTimeRemaining('search');
      setSearchError(`Too many searches. Please try again in ${timeRemaining} minutes.`);
      
      toast({
        title: 'Search limit exceeded',
        description: `Please try again in ${timeRemaining} minutes.`,
        variant: 'destructive',
      });
      
      SecurityUtils.logSecurityEvent('SEARCH_RATE_LIMIT_EXCEEDED', {
        query: query.slice(0, 50), // Only log first 50 chars
        timeRemaining
      });
      return;
    }

    // Validate search query
    try {
      const validatedQuery = searchQuerySchema.parse(query);
      const sanitizedQuery = sanitizeText(validatedQuery);
      
      setSearchTerm(sanitizedQuery);
      
      // Load services with search term
      loadServices({ 
        search: sanitizedQuery, 
        category: selectedCategory 
      });
      
      SecurityUtils.logSecurityEvent('SEARCH_PERFORMED', {
        query: sanitizedQuery.slice(0, 50),
        category: selectedCategory
      });
    } catch (error) {
      setSearchError('Invalid search query');
      
      SecurityUtils.logSecurityEvent('SEARCH_VALIDATION_ERROR', {
        query: query.slice(0, 50),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast({
        title: 'Invalid search',
        description: 'Please enter a valid search query.',
        variant: 'destructive',
      });
    }
  }, [selectedCategory, toast, loadServices]);

  // Debounced search handler
  const handleSearchInput = useCallback((value: string) => {
    if (value.length === 0) {
      setSearchTerm('');
      setSearchError('');
      loadServices({ category: selectedCategory });
      return;
    }
    
    if (value.length >= 2) {
      handleSearch(value);
    }
  }, [handleSearch, loadServices, selectedCategory]);

  // Handle category selection
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    loadServices({ 
      search: searchTerm, 
      category: categoryId 
    });
  }, [searchTerm, loadServices]);

  // Convert services to legacy format for ServiceCard compatibility
  const legacyServices = services.map(convertServiceToLegacy);

  // Client-side sorting (since API doesn't support all sort options)
  const sortedServices = [...legacyServices].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'reviews':
        return b.reviewCount - a.reviewCount;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-4 pb-6">
        <div className="container mx-auto max-w-md">
          <h1 className="text-2xl font-bold mb-4">Find Services</h1>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={18} />
            <Input 
              placeholder="Search services..."
              onChange={(e) => handleSearchInput(e.target.value)}
              className={`pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 ${
                searchError ? 'border-red-300' : ''
              }`}
            />
            {searchError && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-red-100 border border-red-300 rounded-lg p-2">
                <p className="text-sm text-red-700 flex items-center gap-1">
                  <AlertTriangle size={14} />
                  {searchError}
                </p>
              </div>
            )}
          </div>
          
          {/* Filter Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <SlidersHorizontal size={16} className="mr-2" />
              Filters
            </Button>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-white/20 text-white border-white/30 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
                <SelectItem value="price-low">Price: Low</SelectItem>
                <SelectItem value="price-high">Price: High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-md space-y-6">
        {/* Filters */}
        {showFilters && (
          <Card className="border-0 bg-card/50">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Category</h3>
                  <Select value={selectedCategory} onValueChange={handleCategorySelect}>
                    <SelectTrigger>
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
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedCategory('');
                      setSearchTerm('');
                      setSortBy('rating');
                    }}
                  >
                    Clear All
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Categories */}
        <ServiceCategories 
          categories={categories}
          compact={false} 
          onCategorySelect={handleCategorySelect}
          isLoading={isLoading}
        />

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {searchTerm || selectedCategory ? 'Search Results' : 'All Services'}
          </h2>
          <span className="text-sm text-muted-foreground">
            {isLoading ? 'Loading...' : `${pagination.total} services found`}
          </span>
        </div>

        {/* Services Grid */}
        <div className="grid gap-4">
          {isLoading ? (
            <Card className="border-0 bg-muted/30">
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  <Loader2 size={48} className="mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-medium mb-2">Loading services...</h3>
                  <p className="text-sm">
                    Please wait while we fetch the latest services for you.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : sortedServices.length > 0 ? (
                sortedServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    compact={false}
                    onSelect={(service) => {
                      navigate(`/service/${service.id}`);
                    }}
                  />
                ))
          ) : (
            <Card className="border-0 bg-muted/30">
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  <Search size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No services found</h3>
                  <p className="text-sm">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Services;