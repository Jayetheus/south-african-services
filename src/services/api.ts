const API_BASE_URL = 'https://technobytes-backend-2.onrender.com';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'provider';
  phone?: string;
  location?: string;
  avatar_url?: string;
  rating: number;
  is_verified?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  provider: {
    id: string;
    name: string;
    rating: number;
    location: string;
  };
  location: string;
  price: number;
  price_type: 'fixed' | 'hourly';
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
  message: string;
  requested_date: string;
  estimated_duration?: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface Feedback {
  id: string;
  customer: {
    id: string;
    name: string;
  };
  rating: number;
  comment: string;
  created_at: string;
}

class APIService {
  private getAuthHeader() {
    const token = localStorage.getItem('linklocal_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }

    return data.data || data;
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name: string, email: string, password: string, role: 'customer' | 'provider', phone?: string, location?: string) {
    return this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role, phone, location }),
    });
  }

  // Services
  async getServices(params?: {
    category?: string;
    location?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request<{ services: Service[]; pagination: any }>(`/services?${searchParams}`);
  }

  async getService(id: string) {
    return this.request<Service>(`/services/${id}`);
  }

  async createService(serviceData: {
    title: string;
    description: string;
    category: string;
    location: string;
    price: number;
    price_type: 'fixed' | 'hourly';
    images?: string[];
  }) {
    return this.request<Service>('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  // Requests
  async getRequests(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request<{ requests: ServiceRequest[]; pagination: any }>(`/requests?${searchParams}`);
  }

  async createRequest(requestData: {
    service_id: string;
    message: string;
    requested_date: string;
    estimated_duration?: number;
  }) {
    return this.request<ServiceRequest>('/requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async updateRequestStatus(id: string, status: 'accepted' | 'declined') {
    return this.request<ServiceRequest>(`/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Categories
  async getCategories() {
    return this.request<Category[]>('/categories');
  }

  // Profile
  async getProfile() {
    return this.request<User>('/profile');
  }

  async updateProfile(profileData: {
    name?: string;
    phone?: string;
    location?: string;
  }) {
    return this.request<User>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  // Feedback
  async createFeedback(feedbackData: {
    service_request_id: string;
    rating: number;
    comment: string;
  }) {
    return this.request<Feedback>('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  }

  async getProviderFeedback(providerId: string) {
    return this.request<{ feedback: Feedback[]; average_rating: number; total_reviews: number }>(`/feedback/provider/${providerId}`);
  }
}

export const apiService = new APIService();