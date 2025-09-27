export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'provider';
  phone?: string;
  location?: string;
  avatar_url?: string;
  rating: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  provider: User;
  location: string;
  price: number;
  price_type: 'hourly' | 'fixed' | 'negotiable';
  images: string[];
  rating: number;
  review_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequest {
  id: string;
  service: {
    price: number;
    id: string;
    title: string;
    provider: {
      id: string;
      name: string;
    };
  };
  customer: {
    id: string;
    name: string;
  };
  provider: {
    id: string;
    name: string;
  };
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  message?: string;
  requested_date?: string;
  estimated_duration?: number;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  service_request_id: string;
  customer: {
    id: string;
    name: string;
  };
  provider: {
    id: string;
    name: string;
  };
  rating: number;
  comment?: string;
  is_public: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'request' | 'acceptance' | 'decline' | 'completion' | 'feedback' | 'system';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

// Legacy interfaces for backward compatibility during migration
export interface LegacyService {
  id: string;
  title: string;
  description: string;
  category: string;
  providerId: string;
  providerName: string;
  providerImage?: string;
  price: number;
  priceType: 'fixed' | 'hourly' | 'per_item';
  rating: number;
  reviewCount: number;
  location: string;
  images: string[];
  availability: 'available' | 'busy' | 'unavailable';
  responseTime: string;
  verified: boolean;
  tags: string[];
  createdAt: string;
}

export interface LegacyServiceRequest {
  id: string;
  serviceId: string;
  customerId: string;
  providerId: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  description: string;
  estimatedPrice: number;
  finalPrice?: number;
  createdAt: string;
  updatedAt: string;
}