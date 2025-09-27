import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Edit, 
  Save, 
  X,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  Star,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  BookOpen,
  Calculator,
  DollarSign,
  PiggyBank,
  Crown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: '',
    avatar: user?.avatar_url || ''
  });

  const [verificationStatus, setVerificationStatus] = useState({
    isVerified: user?.is_verified || false,
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    submittedAt: '',
    reviewedAt: ''
  });

  const [stats, setStats] = useState({
    totalServices: 0,
    completedJobs: 0,
    averageRating: 0,
    totalEarnings: 0
  });

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getProfile();
        
        if (response.success && response.data) {
          const userData = response.data;
          setProfileData({
            name: userData.name,
            email: userData.email,
            phone: userData.phone || '',
            location: userData.location || '',
            bio: userData.bio || '',
            avatar: userData.avatar_url || ''
          });
          
          setVerificationStatus({
            isVerified: userData.is_verified || false,
            status: userData.verification_status || 'pending',
            submittedAt: userData.verification_submitted_at || '',
            reviewedAt: userData.verification_reviewed_at || ''
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: 'Error loading profile',
          description: 'Failed to load profile data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [toast]);

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      
      const response = await apiClient.updateProfile(profileData);
      
      if (response.success) {
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully.',
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error updating profile',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const getVerificationStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'rejected':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-4 pb-6">
        <div className="container mx-auto max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Profile</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-white hover:bg-white/20"
            >
              {isEditing ? <X size={20} /> : <Edit size={20} />}
            </Button>
          </div>
          
          {/* Profile Summary */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{user?.name}</h2>
              <p className="text-white/90 text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-xs ${getVerificationStatusColor(verificationStatus.status)}`}>
                  {getVerificationStatusIcon(verificationStatus.status)}
                  <span className="ml-1">{formatStatus(verificationStatus.status)}</span>
                </Badge>
                {user?.role === 'provider' && (
                  <Badge variant="outline" className="text-xs text-white/90 border-white/30">
                    Provider
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-md space-y-6">
        {/* Verification Status Card */}
        {user?.role === 'provider' && (
          <Card className="border-0 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield size={20} />
                Verification Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status</span>
                  <Badge className={`text-xs ${getVerificationStatusColor(verificationStatus.status)}`}>
                    {getVerificationStatusIcon(verificationStatus.status)}
                    <span className="ml-1">{formatStatus(verificationStatus.status)}</span>
                  </Badge>
                </div>
                
                {verificationStatus.status === 'pending' && (
                  <p className="text-sm text-muted-foreground">
                    Your verification is under review. This usually takes 1-2 business days.
                  </p>
                )}
                
                {verificationStatus.status === 'rejected' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      Your verification was rejected. Please check the requirements and resubmit.
                    </p>
                  </div>
                )}
                
                {verificationStatus.status === 'approved' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      Your account is verified! You can now offer services to customers.
                    </p>
                  </div>
                )}
                
                {verificationStatus.status !== 'approved' && (
                  <Button
                    onClick={() => window.location.href = '/verification'}
                    className="w-full bg-gradient-primary"
                  >
                    <Shield size={16} className="mr-2" />
                    {verificationStatus.status === 'rejected' ? 'Resubmit Verification' : 'Complete Verification'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Information */}
        <Card className="border-0 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                type="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                placeholder="+27 82 123 4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profileData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={!isEditing}
                placeholder="Cape Town, Western Cape"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-primary"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Provider Stats */}
        {user?.role === 'provider' && (
          <Card className="border-0 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Your Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <TrendingUp size={20} className="mx-auto mb-2 text-primary" />
                  <div className="text-lg font-bold">{stats.totalServices}</div>
                  <div className="text-xs text-muted-foreground">Services</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <CheckCircle size={20} className="mx-auto mb-2 text-green-500" />
                  <div className="text-lg font-bold">{stats.completedJobs}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <Star size={20} className="mx-auto mb-2 text-yellow-500" />
                  <div className="text-lg font-bold">{stats.averageRating}</div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <Calendar size={20} className="mx-auto mb-2 text-blue-500" />
                  <div className="text-lg font-bold">R{stats.totalEarnings}</div>
                  <div className="text-xs text-muted-foreground">Earnings</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Business Tools */}
        <Card className="border-0 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Business Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => window.location.href = '/learning'}
            >
              <BookOpen size={16} className="mr-3" />
              Learning Hub
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => window.location.href = '/bookkeeping'}
            >
              <Calculator size={16} className="mr-3" />
              Bookkeeping
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => window.location.href = '/pricing'}
            >
              <DollarSign size={16} className="mr-3" />
              Pricing Tools
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => window.location.href = '/savings'}
            >
              <PiggyBank size={16} className="mr-3" />
              Savings & Credit
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => window.location.href = '/prime'}
            >
              <Crown size={16} className="mr-3" />
              Prime Features
            </Button>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="border-0 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => window.location.href = '/notifications'}
            >
              <Bell size={16} className="mr-3" />
              Notifications
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings size={16} className="mr-3" />
              Preferences
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <HelpCircle size={16} className="mr-3" />
              Help & Support
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={logout}
            >
              <LogOut size={16} className="mr-3" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;