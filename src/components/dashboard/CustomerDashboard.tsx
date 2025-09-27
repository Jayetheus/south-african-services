import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Clock, TrendingUp, Search, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Mock data for services
const popularServices = [
  {
    id: '1',
    title: 'House Cleaning',
    provider: 'Sarah Nkomo',
    rating: 4.8,
    price: 'R150/hour',
    location: 'Sandton',
    category: 'Cleaning',
    image: '🏠',
  },
  {
    id: '2',
    title: 'Plumbing Repairs',
    provider: 'Mike Thompson',
    rating: 4.9,
    price: 'R200/hour',
    location: 'Rosebank',
    category: 'Maintenance',
    image: '🔧',
  },
  {
    id: '3',
    title: 'Math Tutoring',
    provider: 'Dr. Thabo Mthembu',
    rating: 5.0,
    price: 'R120/hour',
    location: 'Centurion',
    category: 'Education',
    image: '📚',
  },
];

const recentActivity = [
  {
    id: '1',
    type: 'request',
    title: 'Garden maintenance request sent',
    time: '2 hours ago',
    status: 'pending',
  },
  {
    id: '2',
    type: 'completed',
    title: 'Plumbing repair completed',
    time: '1 day ago',
    status: 'completed',
  },
];

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-primary rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-xl">👋</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
            <p className="text-white/90">Find trusted local services in your area</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{user?.location || 'Cape Town, SA'}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>500+ services available</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="gradient-secondary" className="h-20 flex-col gap-2">
          <Search className="h-6 w-6" />
          <span className="text-sm font-medium">Find Services</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2 border-2">
          <MessageSquare className="h-6 w-6 text-accent" />
          <span className="text-sm font-medium">My Requests</span>
        </Button>
      </div>

      {/* Popular Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Popular in Your Area
          </CardTitle>
          <CardDescription>
            Top-rated services available near you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {popularServices.map((service) => (
              <div key={service.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="text-2xl">{service.image}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{service.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {service.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{service.provider}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current text-yellow-400" />
                      <span>{service.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{service.location}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary">{service.price}</p>
                  <Button size="sm" className="mt-1 h-7 text-xs">
                    Book
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'completed' ? 'bg-secondary' : 'bg-primary'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <Badge variant={activity.status === 'completed' ? 'default' : 'outline'}>
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDashboard;