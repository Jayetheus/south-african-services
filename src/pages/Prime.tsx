import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  MapPin, 
  Bell, 
  Zap,
  Star,
  TrendingUp,
  Settings,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Target,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useToast } from '@/hooks/use-toast';

interface PrimeFeature {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  icon: React.ReactNode;
  benefits: string[];
}

interface LocationJob {
  id: string;
  title: string;
  description: string;
  location: string;
  distance: number; // in km
  price: number;
  urgency: 'low' | 'medium' | 'high';
  postedAt: string;
  isAutoApplied: boolean;
  matchScore: number; // 0-100
}

interface AutoApplication {
  id: string;
  serviceType: string;
  location: string;
  radius: number; // in km
  minPrice: number;
  maxPrice: number;
  isActive: boolean;
  applicationsCount: number;
  successRate: number;
}

const Prime: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [locationJobs, setLocationJobs] = useState<LocationJob[]>([]);
  const [autoApplications, setAutoApplications] = useState<AutoApplication[]>([]);

  const [primeFeatures, setPrimeFeatures] = useState<PrimeFeature[]>([
    {
      id: 'location-notifications',
      name: 'Location-Based Job Notifications',
      description: 'Get instant notifications about jobs near your location',
      isEnabled: true,
      icon: <MapPin size={20} className="text-blue-500" />,
      benefits: [
        'Real-time job alerts within 5km radius',
        'Priority notification delivery',
        'Customizable distance settings',
        'Urgency-based filtering'
      ]
    },
    {
      id: 'auto-application',
      name: 'Smart Auto-Application',
      description: 'Automatically apply for jobs based on your profile and preferences',
      isEnabled: true,
      icon: <Zap size={20} className="text-yellow-500" />,
      benefits: [
        'AI-powered job matching',
        'Automatic application submission',
        'Customizable criteria',
        'Success rate tracking'
      ]
    },
    {
      id: 'priority-support',
      name: 'Priority Customer Support',
      description: 'Get faster response times and dedicated support',
      isEnabled: true,
      icon: <Users size={20} className="text-green-500" />,
      benefits: [
        '24/7 priority support',
        'Dedicated account manager',
        'Faster issue resolution',
        'Premium support channels'
      ]
    },
    {
      id: 'advanced-analytics',
      name: 'Advanced Analytics',
      description: 'Detailed insights into your business performance',
      isEnabled: true,
      icon: <TrendingUp size={20} className="text-purple-500" />,
      benefits: [
        'Revenue analytics',
        'Customer insights',
        'Performance metrics',
        'Growth recommendations'
      ]
    }
  ]);

  // Load prime data
  useEffect(() => {
    const loadPrimeData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockLocationJobs: LocationJob[] = [
          {
            id: '1',
            title: 'Kitchen Sink Repair',
            description: 'Leaky kitchen sink needs immediate repair',
            location: 'Sea Point, Cape Town',
            distance: 2.3,
            price: 350,
            urgency: 'high',
            postedAt: '2024-01-15T10:30:00Z',
            isAutoApplied: true,
            matchScore: 95
          },
          {
            id: '2',
            title: 'Bathroom Renovation',
            description: 'Complete bathroom renovation project',
            location: 'Green Point, Cape Town',
            distance: 3.1,
            price: 8500,
            urgency: 'medium',
            postedAt: '2024-01-15T09:15:00Z',
            isAutoApplied: false,
            matchScore: 78
          },
          {
            id: '3',
            title: 'Electrical Panel Upgrade',
            description: 'Upgrade electrical panel to meet safety standards',
            location: 'Claremont, Cape Town',
            distance: 4.2,
            price: 1200,
            urgency: 'low',
            postedAt: '2024-01-15T08:45:00Z',
            isAutoApplied: true,
            matchScore: 88
          }
        ];

        const mockAutoApplications: AutoApplication[] = [
          {
            id: '1',
            serviceType: 'Plumbing',
            location: 'Cape Town',
            radius: 10,
            minPrice: 200,
            maxPrice: 2000,
            isActive: true,
            applicationsCount: 12,
            successRate: 75
          },
          {
            id: '2',
            serviceType: 'Electrical',
            location: 'Cape Town',
            radius: 15,
            minPrice: 300,
            maxPrice: 5000,
            isActive: true,
            applicationsCount: 8,
            successRate: 62
          }
        ];
        
        setLocationJobs(mockLocationJobs);
        setAutoApplications(mockAutoApplications);
      } catch (error) {
        console.error('Error loading prime data:', error);
        toast({
          title: 'Error loading data',
          description: 'Failed to load prime features data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPrimeData();
  }, [toast]);

  const toggleFeature = (featureId: string) => {
    setPrimeFeatures(prev =>
      prev.map(feature =>
        feature.id === featureId
          ? { ...feature, isEnabled: !feature.isEnabled }
          : feature
      )
    );
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return <AlertCircle size={14} className="text-red-500" />;
      case 'medium':
        return <Clock size={14} className="text-yellow-500" />;
      case 'low':
        return <CheckCircle size={14} className="text-green-500" />;
      default:
        return <Clock size={14} className="text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const totalApplications = autoApplications.reduce((sum, app) => sum + app.applicationsCount, 0);
  const averageSuccessRate = autoApplications.length > 0 
    ? autoApplications.reduce((sum, app) => sum + app.successRate, 0) / autoApplications.length 
    : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 pb-6">
        <div className="container mx-auto max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <Crown size={24} />
            <h1 className="text-2xl font-bold">Prime Features</h1>
          </div>
          <p className="text-white/90 text-sm">
            Unlock premium features to grow your business
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-md space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Nearby Jobs</TabsTrigger>
            <TabsTrigger value="auto">Auto-Apply</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Prime Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-0 bg-card/50">
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Zap size={20} className="text-yellow-500" />
                  </div>
                  <div className="text-lg font-bold">{totalApplications}</div>
                  <div className="text-xs text-muted-foreground">Auto Applications</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-card/50">
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Target size={20} className="text-green-500" />
                  </div>
                  <div className="text-lg font-bold">{Math.round(averageSuccessRate)}%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </CardContent>
              </Card>
            </div>

            {/* Prime Features */}
            <Card className="border-0 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">Your Prime Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {primeFeatures.map((feature) => (
                  <div key={feature.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-foreground">{feature.name}</h3>
                        <Switch
                          checked={feature.isEnabled}
                          onCheckedChange={() => toggleFeature(feature.id)}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {feature.description}
                      </p>
                      <div className="space-y-1">
                        {feature.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle size={12} className="text-green-500" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nearby Jobs Tab */}
          <TabsContent value="jobs" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Jobs Near You</h2>
              <Badge className="bg-blue-100 text-blue-700">
                {locationJobs.length} available
              </Badge>
            </div>

            <div className="space-y-3">
              {locationJobs.map((job) => (
                <Card key={job.id} className="border-0 bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground mb-1">{job.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {job.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getUrgencyColor(job.urgency)}`}>
                          {getUrgencyIcon(job.urgency)}
                          <span className="ml-1">{job.urgency}</span>
                        </Badge>
                        {job.isAutoApplied && (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            Auto Applied
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin size={14} />
                          <span>{job.location}</span>
                        </div>
                        <span className="text-muted-foreground">{job.distance}km away</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary">R{job.price}</span>
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-500" />
                            <span className="text-sm text-muted-foreground">{job.matchScore}% match</span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(job.postedAt)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1 bg-gradient-primary">
                        View Details
                      </Button>
                      {!job.isAutoApplied && (
                        <Button size="sm" variant="outline" className="flex-1">
                          Apply Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Auto-Apply Tab */}
          <TabsContent value="auto" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Auto-Application Rules</h2>
              <Button size="sm" className="bg-gradient-primary">
                <Zap size={16} className="mr-2" />
                New Rule
              </Button>
            </div>

            <div className="space-y-3">
              {autoApplications.map((app) => (
                <Card key={app.id} className="border-0 bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-foreground">{app.serviceType}</h3>
                        <p className="text-sm text-muted-foreground">
                          {app.location} • {app.radius}km radius
                        </p>
                      </div>
                      <Badge className={app.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {app.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Price Range</span>
                        <span className="font-medium">R{app.minPrice} - R{app.maxPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Applications</span>
                        <span className="font-medium">{app.applicationsCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Success Rate</span>
                        <span className="font-medium">{app.successRate}%</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings size={14} className="mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <TrendingUp size={14} className="mr-1" />
                        Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Prime;
