import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, Shield } from 'lucide-react';
import { Service } from '@/types/service';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  service: Service;
  onSelect?: (service: Service) => void;
  compact?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  onSelect, 
  compact = false 
}) => {
  const handleSelect = () => {
    onSelect?.(service);
  };

  const formatPrice = (price: number, type: string) => {
    const formatted = `R${price.toLocaleString()}`;
    switch (type) {
      case 'hourly': return `${formatted}/hr`;
      case 'per_item': return `${formatted}/item`;
      default: return formatted;
    }
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden hover:shadow-card transition-all duration-200 cursor-pointer border-0 bg-card",
        compact ? "hover:scale-102" : "hover:scale-105"
      )}
      onClick={handleSelect}
    >
      <div className="aspect-video relative overflow-hidden bg-muted">
        {service.images[0] ? (
          <img 
            src={service.images[0]} 
            alt={service.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {typeof service.category === 'string' ? service.category : service.category.name}
            </span>
          </div>
        )}
        
        {service.provider?.rating > 4.5 && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-white/90 text-xs">
              <Shield size={12} className="mr-1" />
              Verified
            </Badge>
          </div>
        )}
        
        <div className="absolute bottom-2 left-2">
          <Badge 
            variant="secondary" 
            className="text-xs font-medium bg-green-500/90 text-white"
          >
            Available
          </Badge>
        </div>
      </div>
      
      <CardContent className={cn("p-4 space-y-3", compact && "p-3 space-y-2")}>
        <div className="space-y-1">
          <h3 className={cn(
            "font-semibold text-foreground line-clamp-1",
            compact ? "text-sm" : "text-base"
          )}>
            {service.title}
          </h3>
          <p className={cn(
            "text-muted-foreground line-clamp-2",
            compact ? "text-xs" : "text-sm"
          )}>
            {service.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className={cn(
                "font-medium",
                compact ? "text-xs" : "text-sm"
              )}>
                {service.rating}
              </span>
              <span className={cn(
                "text-muted-foreground",
                compact ? "text-xs" : "text-sm"
              )}>
                ({service.review_count})
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className={cn(
              "font-bold text-primary",
              compact ? "text-sm" : "text-base"
            )}>
              {formatPrice(service.price, service.price_type)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            <span className="truncate">{service.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>2h response</span>
          </div>
        </div>

        {!compact && (
          <div className="pt-2">
            <Button 
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              size="sm"
            >
              Book Now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceCard;