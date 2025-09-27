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
    // Check for stored authentication token
    const checkStoredAuth = () => {
      try {
        const storedUser = localStorage.getItem('sa_services_user');
        const token = localStorage.getItem('sa_services_token');

        if (storedUser && token) {
          const user = JSON.parse(storedUser);
          setUser(user);
          apiClient.setToken(token);
        }
      } catch (error) {
        console.error('Error checking stored auth:', error);
        localStorage.removeItem('sa_services_user');
        localStorage.removeItem('sa_services_token');
        apiClient.clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    checkStoredAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiClient.login(email, password);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        // Set token in API client
        apiClient.setToken(token);
        
        // Store user data
        localStorage.setItem('sa_services_user', JSON.stringify(user));
        setUser(user);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error instanceof Error ? error.message : 'Login failed');
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
        const { token, user } = response.data;
        
        // Set token in API client
        apiClient.setToken(token);
        
        // Store user data
        localStorage.setItem('sa_services_user', JSON.stringify(user));
        setUser(user);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('sa_services_user');
    apiClient.clearToken();
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