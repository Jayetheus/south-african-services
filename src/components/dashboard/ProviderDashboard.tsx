import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, Star, Users, DollarSign, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Mock data for provider stats
const providerStats = {
  totalServices: 3,
  activeRequests: 5,
  completedJobs: 42,
  rating: 4.8,
  earnings: 'R8,450',
};

const myServices = [
  {
    id: '1',
    title: 'Professional House Cleaning',
    category: 'Cleaning',
    price: 'R150/hour',
    status: 'active',
    requests: 3,
  },
  {
    id: '2',
    title: 'Garden Maintenance',
    category: 'Outdoor',
    price: 'R200/day',
    status: 'active',
    requests: 2,
  },
];

const recentRequests = [
  {
    id: '1',
    service: 'House Cleaning',
    customer: 'Jane Smith',
    date: 'Tomorrow, 10:00 AM',
    location: 'Sandton',
    status: 'pending',
  },
  {
    id: '2',
    service: 'Garden Maintenance',
    customer: 'John Doe',
    date: 'Friday, 2:00 PM',
    location: 'Rosebank',
    status: 'pending',
  },
];

const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-secondary rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-xl">💼</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Good morning, {user?.name?.split(' ')[0]}</h1>
            <p className="text-white/90">Your business dashboard</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{providerStats.activeRequests}</p>
            <p className="text-sm text-white/80">Active Requests</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{providerStats.rating}</p>
            <p className="text-sm text-white/80">Rating</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{providerStats.earnings}</p>
            <p className="text-sm text-white/80">This Month</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="gradient" className="h-20 flex-col gap-2">
          <Plus className="h-6 w-6" />
          <span className="text-sm font-medium">Add Service</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2 border-2">
          <Clock className="h-6 w-6 text-accent" />
          <span className="text-sm font-medium">View Requests</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed Jobs</p>
                <p className="text-xl font-bold">{providerStats.completedJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                <Star className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-xl font-bold">{providerStats.rating} ⭐</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Services */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                My Services
              </CardTitle>
              <CardDescription>
                Manage your service offerings
              </CardDescription>
            </div>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{service.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      {service.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-medium text-primary">{service.price}</span>
                    <span>{service.requests} pending requests</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-secondary/10 text-secondary border-secondary">
                    {service.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Pending Requests
          </CardTitle>
          <CardDescription>
            New service requests from customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium mb-1">{request.service}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {request.customer} • {request.location}
                  </p>
                  <p className="text-xs text-muted-foreground">{request.date}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Decline
                  </Button>
                  <Button size="sm" className="bg-secondary hover:bg-secondary/90">
                    Accept
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderDashboard;