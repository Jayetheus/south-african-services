import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, User } from '@/services/api';

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
        const storedUser = localStorage.getItem('linklocal_user');
        const token = localStorage.getItem('linklocal_token');
        
        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking stored auth:', error);
        localStorage.removeItem('linklocal_user');
        localStorage.removeItem('linklocal_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkStoredAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const response = await apiService.login(email, password);
      
      localStorage.setItem('linklocal_user', JSON.stringify(response.user));
      localStorage.setItem('linklocal_token', response.token);
      
      setUser(response.user);
    } catch (error) {
      throw new Error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    
    try {
      const response = await apiService.register(name, email, password, role);
      
      localStorage.setItem('linklocal_user', JSON.stringify(response.user));
      localStorage.setItem('linklocal_token', response.token);
      
      setUser(response.user);
    } catch (error) {
      throw new Error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('linklocal_user');
    localStorage.removeItem('linklocal_token');
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