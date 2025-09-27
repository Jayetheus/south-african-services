import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  Calendar, 
  Edit2, 
  LogOut,
  Shield,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/layout/BottomNavigation';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await apiService.updateProfile(formData);
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'provider' ? 'default' : 'secondary';
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <Avatar className="w-20 h-20 mb-4">
                <AvatarImage src={user?.avatar_url} alt={user?.name} />
                <AvatarFallback className="text-lg">
                  {user?.name ? getUserInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-xl font-bold">{user?.name}</h1>
                <Badge variant={getRoleBadgeVariant(user?.role || 'customer')}>
                  {user?.role}
                </Badge>
              </div>
              
              {user?.rating && user.rating > 0 && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <span>{user.rating.toFixed(1)} rating</span>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground mt-1">
                Member since {new Date(user?.created_at || '').toLocaleDateString()}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              className="w-full gap-2"
            >
              <Edit2 className="h-4 w-4" />
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </Button>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter your location"
                  />
                </div>
                
                <Button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.email}</span>
                </div>
                
                {user?.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                )}
                
                {user?.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{user.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {new Date(user?.created_at || '').toLocaleDateString()}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Email Verified</span>
              <Badge variant={user?.is_verified ? 'default' : 'outline'}>
                {user?.is_verified ? 'Verified' : 'Not Verified'}
              </Badge>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Account Status</span>
              <Badge variant={user?.is_active ? 'default' : 'destructive'}>
                {user?.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Shield className="h-4 w-4" />
              Privacy Settings
            </Button>
            
            <Button variant="outline" className="w-full justify-start gap-2">
              <Star className="h-4 w-4" />
              My Reviews
            </Button>
            
            {user?.role === 'provider' && (
              <Button variant="outline" className="w-full justify-start gap-2">
                <User className="h-4 w-4" />
                My Services
              </Button>
            )}
            
            <Separator />
            
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="w-full justify-start gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Profile;