import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Wrench, 
  Scissors, 
  Car, 
  Home, 
  Paintbrush, 
  Zap, 
  Trees, 
  Shield,
  Laptop,
  Camera,
  Utensils,
  Heart,
  Sparkles,
  Leaf
} from 'lucide-react';
import { ServiceCategory } from '@/types/service';
import { cn } from '@/lib/utils';

const iconMap = {
  home: Home,
  wrench: Wrench,
  scissors: Scissors,
  car: Car,
  paintbrush: Paintbrush,
  zap: Zap,
  trees: Trees,
  leaf: Leaf,
  shield: Shield,
  laptop: Laptop,
  camera: Camera,
  utensils: Utensils,
  heart: Heart,
  sparkles: Sparkles,
  // Fallback for unknown icons
  default: Home
};

interface ServiceCategoriesProps {
  categories?: ServiceCategory[];
  onCategorySelect?: (categoryId: string) => void;
  compact?: boolean;
  isLoading?: boolean;
}

const ServiceCategories: React.FC<ServiceCategoriesProps> = ({ 
  categories = [],
  onCategorySelect, 
  compact = true,
  isLoading = false
}) => {
  const handleCategoryClick = (categoryId: string) => {
    onCategorySelect?.(categoryId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Service Categories</h2>
        </div>
        <div className={cn(
          "grid gap-3",
          compact ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
        )}>
          {Array.from({ length: compact ? 6 : 8 }).map((_, index) => (
            <Card key={index} className="border-0 bg-muted/30">
              <CardContent className="p-4 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-muted animate-pulse" />
                <div className="space-y-1">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3 mx-auto" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Service Categories</h2>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p>No categories available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Service Categories</h2>
        {compact && (
          <button className="text-sm text-primary hover:text-primary/80 font-medium">
            View All
          </button>
        )}
      </div>
      
      <div className={cn(
        "grid gap-3",
        compact ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
      )}>
        {(compact ? categories.slice(0, 6) : categories).map((category) => {
          const IconComponent = iconMap[category.icon as keyof typeof iconMap] || iconMap.default;
          
          return (
            <Card 
              key={category.id}
              className="cursor-pointer hover:shadow-card transition-all duration-200 hover:scale-105 border-0 bg-gradient-to-br from-background to-muted/30"
              onClick={() => handleCategoryClick(category.id)}
            >
              <CardContent className="p-4 text-center space-y-2">
                <div 
                  className="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: category.color }}
                >
                  <IconComponent size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-foreground leading-tight">
                    {category.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {category.description || 'Services available'}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceCategories;