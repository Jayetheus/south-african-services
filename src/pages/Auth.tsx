import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Shield, AlertTriangle } from 'lucide-react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSecureForm } from '@/hooks/useSecureForm';
import { loginFormSchema, registerFormSchema, loginRateLimiter, SecurityUtils, sanitizeText } from '@/lib/security';
import heroImage from '@/assets/hero-sa-services.jpg';

const Auth: React.FC = () => {
  const { login, register } = useAuth();
  const { toast } = useToast();

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer' as UserRole,
  });

  // Secure login form with rate limiting
  const loginFormHandler = useSecureForm({
    schema: loginFormSchema,
    rateLimiter: loginRateLimiter,
    identifier: loginForm.email || 'anonymous',
    onSubmit: async (data) => {
      try {
        await login(data.email, data.password);
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.',
        });
        
        SecurityUtils.logSecurityEvent('LOGIN_SUCCESS', {
          email: data.email
        });
      } catch (error) {
        SecurityUtils.logSecurityEvent('LOGIN_FAILED', {
          email: data.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        toast({
          title: 'Login failed',
          description: 'Please check your credentials and try again.',
          variant: 'destructive',
        });
        throw error; // Re-throw to trigger rate limiting
      }
    },
  });

  // Secure registration form
  const registerFormHandler = useSecureForm({
    schema: registerFormSchema,
    identifier: registerForm.email || 'anonymous',
    onSubmit: async (data) => {
      try {
        // Sanitize name input
        const sanitizedName = sanitizeText(data.name);
        
        await register(
          sanitizedName,
          data.email,
          data.password,
          data.role
        );
        
        toast({
          title: 'Account created!',
          description: 'Welcome to SA Services.',
        });
        
        SecurityUtils.logSecurityEvent('REGISTRATION_SUCCESS', {
          email: data.email,
          role: data.role
        });
      } catch (error) {
        SecurityUtils.logSecurityEvent('REGISTRATION_FAILED', {
          email: data.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        toast({
          title: 'Registration failed',
          description: 'Please try again later.',
          variant: 'destructive',
        });
        throw error;
      }
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginFormHandler.validateAndSubmit(loginForm);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerFormHandler.validateAndSubmit(registerForm);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Link Local Services" 
          className="w-full h-full object-cover sticky"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-3xl font-bold text-white mb-2">Link Local</h1>
          <p className="text-white/90 text-lg mb-4">Find trusted local service providers</p>
          
          <div className="flex items-center gap-4 text-white/80 text-sm">
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              <span>All of South Africa</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={16} />
              <span>Verified providers</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield size={16} />
              <span>Secure payments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Form */}
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card className="border-0 shadow-card">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-foreground">Get Started</CardTitle>
            <CardDescription>
              Join thousands of South Africans finding and offering services
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                      className={loginFormHandler.getFieldError('email') ? 'border-destructive' : ''}
                    />
                    {loginFormHandler.getFieldError('email') && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertTriangle size={14} />
                        {loginFormHandler.getFieldError('email')}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                      className={loginFormHandler.getFieldError('password') ? 'border-destructive' : ''}
                    />
                    {loginFormHandler.getFieldError('password') && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertTriangle size={14} />
                        {loginFormHandler.getFieldError('password')}
                      </p>
                    )}
                  </div>

                  {/* Rate limiting warning */}
                  {loginFormHandler.isBlocked && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <Shield size={16} />
                        Too many login attempts. Please try again in {loginFormHandler.blockTimeRemaining} minutes.
                      </p>
                    </div>
                  )}

                  {/* General form errors */}
                  {loginFormHandler.getFieldError('submit') && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <AlertTriangle size={16} />
                        {loginFormHandler.getFieldError('submit')}
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:opacity-90"
                    disabled={loginFormHandler.isSubmitting || loginFormHandler.isBlocked}
                  >
                    {loginFormHandler.isSubmitting ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
                
                <div className="text-center text-sm text-muted-foreground">
                  Demo accounts: customer@test.com / provider@test.com (any password)
                </div>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="John Doe"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      required
                      className={registerFormHandler.getFieldError('name') ? 'border-destructive' : ''}
                    />
                    {registerFormHandler.getFieldError('name') && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertTriangle size={14} />
                        {registerFormHandler.getFieldError('name')}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="you@example.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      required
                      className={registerFormHandler.getFieldError('email') ? 'border-destructive' : ''}
                    />
                    {registerFormHandler.getFieldError('email') && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertTriangle size={14} />
                        {registerFormHandler.getFieldError('email')}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={registerForm.role === 'customer' ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => setRegisterForm({ ...registerForm, role: 'customer' })}
                      >
                        Customer
                      </Button>
                      <Button
                        type="button"
                        variant={registerForm.role === 'provider' ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => setRegisterForm({ ...registerForm, role: 'provider' })}
                      >
                        Service Provider
                      </Button>
                    </div>
                    {registerFormHandler.getFieldError('role') && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertTriangle size={14} />
                        {registerFormHandler.getFieldError('role')}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a strong password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                      className={registerFormHandler.getFieldError('password') ? 'border-destructive' : ''}
                    />
                    {registerFormHandler.getFieldError('password') && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertTriangle size={14} />
                        {registerFormHandler.getFieldError('password')}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Password must contain at least 8 characters, including uppercase, lowercase, and numbers
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm">Confirm Password</Label>
                    <Input
                      id="register-confirm"
                      type="password"
                      placeholder="Confirm your password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      required
                      className={registerFormHandler.getFieldError('confirmPassword') ? 'border-destructive' : ''}
                    />
                    {registerFormHandler.getFieldError('confirmPassword') && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertTriangle size={14} />
                        {registerFormHandler.getFieldError('confirmPassword')}
                      </p>
                    )}
                  </div>

                  {/* General form errors */}
                  {registerFormHandler.getFieldError('submit') && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <AlertTriangle size={16} />
                        {registerFormHandler.getFieldError('submit')}
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:opacity-90"
                    disabled={registerFormHandler.isSubmitting}
                  >
                    {registerFormHandler.isSubmitting ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Trust Indicators */}
        <div className="mt-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <Badge variant="secondary" className="bg-green-50 text-green-700">
              <Shield size={12} className="mr-1" />
              Secure & Verified
            </Badge>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              <Star size={12} className="mr-1" />
              Trusted Reviews
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground leading-relaxed">
            By signing up, you agree to our Terms of Service and Privacy Policy.
            We're committed to keeping your information safe and secure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;