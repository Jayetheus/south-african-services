import axios from 'axios';
import { User, Service, ServiceRequest, ServiceCategory } from '@/types/service';

// Demo mode checker - will be set by DemoContext
let isDemoMode = false;
let demoServices: Service[] = [];
let demoRequests: ServiceRequest[] = [];

export const setDemoMode = (enabled: boolean, services: Service[] = [], requests: ServiceRequest[] = []) => {
  isDemoMode = enabled;
  demoServices = services;
  demoRequests = requests;
};

const BASE_URL = 'https://technobytes-backend-2.onrender.com';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  error: string | null;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export const api = {
  // Authentication
  login: async (email: string, password: string): Promise<LoginResponse> => {
    if (isDemoMode) {
      // Return mock login response for demo
      return {
        token: 'demo-token-123',
        user: {
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
        }
      };
    }
    
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', {
      email,
      password,
    });
    
    if (response.data.success && response.data.data) {
      localStorage.setItem('auth_token', response.data.data.token);
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Login failed');
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'customer' | 'provider';
    phone?: string;
    location?: string;
  }): Promise<RegisterResponse> => {
    if (isDemoMode) {
      // Return mock register response for demo
      return {
        token: 'demo-token-123',
        user: {
          id: 'user-123',
          name: userData.name,
          email: userData.email,
          role: userData.role,
          phone: userData.phone,
          location: userData.location || 'South Africa',
          rating: 0,
          is_verified: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    }
    
    const response = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', userData);
    
    if (response.data.success && response.data.data) {
      localStorage.setItem('auth_token', response.data.data.token);
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Registration failed');
  },

  // Services
  getServices: async (params?: {
    category?: string;
    location?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ services: Service[]; pagination: any }> => {
    if (isDemoMode) {
      let filteredServices = [...demoServices];
      
      if (params?.search) {
        filteredServices = filteredServices.filter(service => 
          service.title.toLowerCase().includes(params.search!.toLowerCase()) ||
          service.description.toLowerCase().includes(params.search!.toLowerCase())
        );
      }
      
      if (params?.category) {
        filteredServices = filteredServices.filter(service => 
          service.category.id === params.category
        );
      }
      
      return {
        services: filteredServices,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredServices.length,
          pages: 1
        }
      };
    }
    
    const response = await apiClient.get<ApiResponse<{ services: Service[]; pagination: any }>>('/services', { params });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to fetch services');
  },

  getService: async (id: string): Promise<Service> => {
    if (isDemoMode) {
      const service = demoServices.find(s => s.id === id);
      if (!service) throw new Error('Service not found');
      return service;
    }
    
    const response = await apiClient.get<ApiResponse<Service>>(`/services/${id}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to fetch service');
  },

  createService: async (serviceData: {
    title: string;
    description: string;
    category: string;
    location: string;
    price: number;
    price_type: 'hourly' | 'fixed' | 'negotiable';
    images?: string[];
  }): Promise<Service> => {
    if (isDemoMode) {
      // Return mock created service for demo
      const newService: Service = {
        id: `service-${Date.now()}`,
        title: serviceData.title,
        description: serviceData.description,
        category: {
          id: serviceData.category,
          name: 'Demo Category',
          icon: 'home',
          color: '#2E8B57',
          description: 'Demo category',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        provider: {
          id: 'user-123',
          name: 'John Demo',
          email: 'demo@linklocal.co.za',
          role: 'provider',
          location: 'Cape Town, South Africa',
          rating: 4.5,
          is_verified: true,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        location: serviceData.location,
        price: serviceData.price,
        price_type: serviceData.price_type,
        images: serviceData.images || [],
        rating: 0,
        review_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add to demo services
      demoServices.push(newService);
      return newService;
    }
    
    const response = await apiClient.post<ApiResponse<Service>>('/services', serviceData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to create service');
  },

  // Requests
  getRequests: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ requests: ServiceRequest[]; pagination: any }> => {
    if (isDemoMode) {
      let filteredRequests = [...demoRequests];
      
      if (params?.status) {
        filteredRequests = filteredRequests.filter(request => 
          request.status === params.status
        );
      }
      
      return {
        requests: filteredRequests,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredRequests.length,
          pages: 1
        }
      };
    }
    
    const response = await apiClient.get<ApiResponse<{ requests: ServiceRequest[]; pagination: any }>>('/requests', { params });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to fetch requests');
  },

  createRequest: async (requestData: {
    service_id: string;
    message: string;
    requested_date: string;
    estimated_duration: number;
  }): Promise<ServiceRequest> => {
    if (isDemoMode) {
      // Find the service from demo data
      const service = demoServices.find(s => s.id === requestData.service_id);
      if (!service) throw new Error('Service not found');
      
      const newRequest: ServiceRequest = {
        id: `request-${Date.now()}`,
        service: {
          id: service.id,
          title: service.title,
          price: service.price,
          provider: {
            id: service.provider.id,
            name: service.provider.name
          }
        },
        customer: {
          id: 'user-123',
          name: 'John Demo'
        },
        provider: {
          id: service.provider.id,
          name: service.provider.name
        },
        status: 'pending',
        message: requestData.message,
        requested_date: requestData.requested_date,
        estimated_duration: requestData.estimated_duration,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add to demo requests
      demoRequests.push(newRequest);
      return newRequest;
    }
    
    const response = await apiClient.post<ApiResponse<ServiceRequest>>('/requests', requestData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to create request');
  },

  updateRequestStatus: async (id: string, status: string): Promise<ServiceRequest> => {
    if (isDemoMode) {
      // Find and update request in demo data
      const requestIndex = demoRequests.findIndex(r => r.id === id);
      if (requestIndex === -1) throw new Error('Request not found');
      
      demoRequests[requestIndex] = {
        ...demoRequests[requestIndex],
        status: status as any,
        updated_at: new Date().toISOString()
      };
      
      return demoRequests[requestIndex];
    }
    
    const response = await apiClient.patch<ApiResponse<ServiceRequest>>(`/requests/${id}`, { status });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to update request');
  },

  // Categories
  getCategories: async (): Promise<ServiceCategory[]> => {
    if (isDemoMode) {
      return [
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
    }
    
    const response = await apiClient.get<ApiResponse<ServiceCategory[]>>('/categories');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to fetch categories');
  },

  // Profile
  getProfile: async (): Promise<User> => {
    if (isDemoMode) {
      return {
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
    }
    
    const response = await apiClient.get<ApiResponse<User>>('/profile');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to fetch profile');
  },

  updateProfile: async (profileData: {
    name?: string;
    phone?: string;
    location?: string;
  }): Promise<User> => {
    if (isDemoMode) {
      // Return updated demo user
      return {
        id: 'user-123',
        name: profileData.name || 'John Demo',
        email: 'demo@linklocal.co.za',
        role: 'customer',
        phone: profileData.phone || '+27123456789',
        location: profileData.location || 'Cape Town, South Africa',
        rating: 4.5,
        is_verified: true,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: new Date().toISOString()
      };
    }
    
    const response = await apiClient.patch<ApiResponse<User>>('/profile', profileData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to update profile');
  },

  // Feedback
  submitFeedback: async (feedbackData: {
    service_request_id: string;
    rating: number;
    comment: string;
  }): Promise<any> => {
    if (isDemoMode) {
      // Return mock feedback submission
      return {
        id: `feedback-${Date.now()}`,
        service_request_id: feedbackData.service_request_id,
        customer: {
          id: 'user-123',
          name: 'John Demo'
        },
        rating: feedbackData.rating,
        comment: feedbackData.comment,
        created_at: new Date().toISOString()
      };
    }
    
    const response = await apiClient.post<ApiResponse<any>>('/feedback', feedbackData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to submit feedback');
  },
};