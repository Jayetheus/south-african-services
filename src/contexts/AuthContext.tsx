import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';
import { User } from '@/types/service';

export type UserRole = 'customer' | 'provider';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication tokens
    const checkStoredAuth = () => {
      try {
        const storedUser = localStorage.getItem('sa_services_user');
        const accessToken = apiClient.getAccessToken();
        const refreshToken = apiClient.getRefreshToken();


        console.log(storedUser, accessToken, refreshToken)
        if (storedUser && accessToken && refreshToken) {
          const user = JSON.parse(storedUser);
          setUser(user);
          
          // Check if access token is still valid
          if (apiClient.isTokenValid()) {
            // Token is valid, user is authenticated
            return;
          } else if (!apiClient.isTokenExpiringSoon(0)) {
            // Access token is expired but refresh token might still be valid
            // The API client will handle refresh automatically on next request
            return;
          } else {
            // Both tokens are invalid, clear everything
            localStorage.removeItem('sa_services_user');
            apiClient.clearTokens();
          }
        }
      } catch (error) {
        console.error('Error checking stored auth:', error);
        localStorage.removeItem('sa_services_user');
        apiClient.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    // Handle token expiration
    const handleTokenExpiration = () => {
      setUser(null);
      setIsLoading(false);
    };

    checkStoredAuth();

    // Listen for token expiration events
    window.addEventListener('tokenExpired', handleTokenExpiration);

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpiration);
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiClient.login(email, password);
      
      if (response.success && response.data) {
        const { access_token, refresh_token, expires_in, user } = response.data;
        
        // Set tokens in API client
        apiClient.setTokens(access_token, refresh_token, expires_in);
        
        // Store user data
        localStorage.setItem('sa_services_user', JSON.stringify(user));
        setUser(user);
      } else {
        // Use the specific error message from the API response
        const errorMessage = response.message || response.error || 'Login failed';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      // Pass through the specific error message from the API
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiClient.register({
        name,
        email,
        password,
        role,
        location: 'South Africa'
      });
      
      if (response.success && response.data) {
        const { access_token, refresh_token, expires_in, user } = response.data;
        
        // Set tokens in API client
        apiClient.setTokens(access_token, refresh_token, expires_in);
        
        // Store user data
        localStorage.setItem('sa_services_user', JSON.stringify(user));
        setUser(user);
      } else {
        // Use the specific error message from the API response
        const errorMessage = response.message || response.error || 'Registration failed';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Pass through the specific error message from the API
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('sa_services_user');
    apiClient.clearTokens();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};