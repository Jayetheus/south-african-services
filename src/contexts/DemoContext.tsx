import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Service, ServiceRequest, User, ServiceCategory } from '@/types/service';

interface DemoContextType {
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  demoServices: Service[];
  demoRequests: ServiceRequest[];
  demoUser: User;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const useDemoMode = (): DemoContextType => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoProvider');
  }
  return context;
};

// Mock data for demo
const mockCategories: ServiceCategory[] = [
  {
    id: 'cat-001',
    name: 'Home Services',
    icon: 'home',
    color: '#2E8B57',
    description: 'Household maintenance and services',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-002',
    name: 'Garden & Landscaping',
    icon: 'leaf',
    color: '#4CAF50',
    description: 'Outdoor and garden services',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockProviders: User[] = [
  {
    id: 'user-456',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    role: 'provider',
    phone: '+27987654321',
    location: 'Johannesburg, South Africa',
    rating: 4.8,
    is_verified: true,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-789',
    name: 'Mike Thompson',
    email: 'mike@example.com',
    role: 'provider',
    phone: '+27123456789',
    location: 'Cape Town, South Africa',
    rating: 4.6,
    is_verified: true,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockDemoServices: Service[] = [
  {
    id: 'service-123',
    title: 'Professional House Cleaning',
    description: 'Complete house cleaning service including deep cleaning, window cleaning, and organization.',
    category: mockCategories[0],
    provider: mockProviders[0],
    location: 'Johannesburg, South Africa',
    price: 250.00,
    price_type: 'fixed',
    images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'],
    rating: 4.8,
    review_count: 24,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'service-124',
    title: 'Garden Maintenance',
    description: 'Professional garden care including lawn mowing, trimming, and landscaping.',
    category: mockCategories[1],
    provider: mockProviders[1],
    location: 'Cape Town, South Africa',
    price: 180.00,
    price_type: 'hourly',
    images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800'],
    rating: 4.6,
    review_count: 18,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'service-125',
    title: 'Plumbing Repairs',
    description: 'Expert plumbing services for all your home needs.',
    category: mockCategories[0],
    provider: mockProviders[0],
    location: 'Johannesburg, South Africa',
    price: 300.00,
    price_type: 'fixed',
    images: ['https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800'],
    rating: 4.9,
    review_count: 32,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockDemoRequests: ServiceRequest[] = [
  {
    id: 'request-123',
    service: {
      id: 'service-123',
      title: 'Professional House Cleaning',
      price: 250,
      provider: {
        id: 'user-456',
        name: 'Sarah Wilson'
      }
    },
    customer: {
      id: 'user-123',
      name: 'John Doe'
    },
    provider: {
      id: 'user-456',
      name: 'Sarah Wilson'
    },
    status: 'pending',
    message: 'I need cleaning for my 3-bedroom house',
    requested_date: '2024-01-15',
    estimated_duration: 4,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'request-124',
    service: {
      id: 'service-124',
      title: 'Garden Maintenance',
      price: 180,
      provider: {
        id: 'user-789',
        name: 'Mike Thompson'
      }
    },
    customer: {
      id: 'user-123',
      name: 'John Doe'
    },
    provider: {
      id: 'user-789',
      name: 'Mike Thompson'
    },
    status: 'accepted',
    message: 'Need weekly garden maintenance',
    requested_date: '2024-01-20',
    estimated_duration: 2,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z'
  }
];

const mockDemoUser: User = {
  id: 'user-123',
  name: 'John Demo',
  email: 'demo@linklocal.co.za',
  role: 'customer',
  phone: '+27123456789',
  location: 'Cape Town, South Africa',
  rating: 4.5,
  is_verified: true,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

interface DemoProviderProps {
  children: ReactNode;
}

export const DemoProvider: React.FC<DemoProviderProps> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);

  const setDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
  };

  const value: DemoContextType = {
    isDemoMode,
    setDemoMode,
    demoServices: mockDemoServices,
    demoRequests: mockDemoRequests,
    demoUser: mockDemoUser
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
};