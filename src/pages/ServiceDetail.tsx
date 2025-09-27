import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  MessageSquare,
  Heart,
  Share2,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Service } from '@/types/service';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  
  const [bookingData, setBookingData] = useState({
    message: '',
    requestedDate: '',
    estimatedDuration: '',
    specialRequirements: ''
  });

  // Load service details
  useEffect(() => {
    const loadService = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await apiClient.getService(id);
        
        if (response.success && response.data) {
          setService(response.data);
        } else {
          toast({
            title: 'Service not found',
            description: 'The service you are looking for does not exist.',
            variant: 'destructive',
          });
          navigate('/services');
        }
      } catch (error) {
        console.error('Error loading service:', error);
        toast({
          title: 'Error loading service',
          description: 'Failed to load service details. Please try again.',
          variant: 'destructive',
        });
        navigate('/services');
      } finally {
        setIsLoading(false);
      }
    };

    loadService();
  }, [id, navigate, toast]);

  const handleBookingSubmit = async () => {
    if (!service || !user) return;

    try {
      setIsSubmitting(true);
      
      const requestData = {
        service_id: service.id,
        message: bookingData.message,
        requested_date: bookingData.requestedDate,
        estimated_duration: parseInt(bookingData.estimatedDuration) || 1
      };

      const response = await apiClient.createRequest(requestData);
      
      if (response.success) {
        toast({
          title: 'Request sent',
          description: 'Your service request has been sent to the provider.',
        });
        setShowBookingModal(false);
        setBookingData({
          message: '',
          requestedDate: '',
          estimatedDuration: '',
          specialRequirements: ''
        });
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

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? 'Removed from favorites' : 'Added to favorites',
      description: isFavorited 
        ? 'Service removed from your favorites.' 
        : 'Service added to your favorites.',
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: service?.title,
        text: service?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied',
        description: 'Service link copied to clipboard.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-4 py-6 max-w-md">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-64 bg-muted rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
            </div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-4 py-6 max-w-md text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold mb-2">Service not found</h2>
          <p className="text-muted-foreground mb-4">
            The service you are looking for does not exist.
          </p>
          <Button onClick={() => navigate('/services')}>
            Browse Services
          </Button>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-4">
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
            <h1 className="text-xl font-bold flex-1 truncate">{service.title}</h1>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavorite}
                className="text-white hover:bg-white/20 p-2"
              >
                <Heart size={20} className={isFavorited ? 'fill-red-500 text-red-500' : ''} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-white hover:bg-white/20 p-2"
              >
                <Share2 size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-md space-y-6">
        {/* Service Images */}
        <Card className="border-0 bg-card/50">
          <CardContent className="p-0">
            <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
              {service.images && service.images.length > 0 ? (
                <img
                  src={service.images[0]}
                  alt={service.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              ) : (
                <div className="text-muted-foreground text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-sm">No image available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Service Info */}
        <Card className="border-0 bg-card/50">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground mb-2">{service.title}</h2>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-500 fill-current" />
                    <span className="font-medium">{service.rating}</span>
                    <span className="text-muted-foreground text-sm">
                      ({service.review_count} reviews)
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {service.category.name}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-primary">
                  R{service.price}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {service.price_type === 'hourly' ? '/hour' : service.price_type === 'fixed' ? 'fixed' : 'negotiable'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={16} />
                <span className="text-sm">{service.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={16} />
                <span className="text-sm">Available now</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="border-0 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {service.description}
            </p>
          </CardContent>
        </Card>

        {/* Provider Info */}
        <Card className="border-0 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Service Provider</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{service.provider.name}</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{service.provider.rating}</span>
                  </div>
                  {service.provider.is_verified && (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone size={16} />
                <span className="text-sm">{service.provider.phone || 'Phone not available'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail size={16} />
                <span className="text-sm">{service.provider.email || 'Email not available'}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <MessageSquare size={16} className="mr-2" />
                Message
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Phone size={16} className="mr-2" />
                Call
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card className="border-0 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Star size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No reviews yet</p>
              <p className="text-xs">Be the first to review this service</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-20 left-0 right-0 bg-background border-t p-4">
        <div className="container mx-auto max-w-md">
          <Button
            onClick={() => setShowBookingModal(true)}
            className="w-full bg-gradient-primary"
            size="lg"
          >
            <Calendar size={16} className="mr-2" />
            Book This Service
          </Button>
        </div>
      </div>

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Book Service</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message to Provider *</Label>
              <Textarea
                id="message"
                value={bookingData.message}
                onChange={(e) => setBookingData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Describe what you need help with..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requestedDate">Preferred Date</Label>
                <Input
                  id="requestedDate"
                  type="date"
                  value={bookingData.requestedDate}
                  onChange={(e) => setBookingData(prev => ({ ...prev, requestedDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">Duration (hours)</Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  value={bookingData.estimatedDuration}
                  onChange={(e) => setBookingData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                  placeholder="2"
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequirements">Special Requirements</Label>
              <Textarea
                id="specialRequirements"
                value={bookingData.specialRequirements}
                onChange={(e) => setBookingData(prev => ({ ...prev, specialRequirements: e.target.value }))}
                placeholder="Any special requirements or notes..."
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowBookingModal(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBookingSubmit}
                disabled={isSubmitting || !bookingData.message}
                className="flex-1 bg-gradient-primary"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} className="mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
};

export default ServiceDetail;
