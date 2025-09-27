/**
 * API Service Layer for LinkLocal Backend
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = 'https://technobytes-backend-2.onrender.com';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message: string | null;
  error: string | null;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken(): void {
    this.token = localStorage.getItem('sa_services_token');
  }

  public setToken(token: string): void {
    this.token = token;
    localStorage.setItem('sa_services_token', token);
  }

  public clearToken(): void {
    this.token = null;
    localStorage.removeItem('sa_services_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: 'customer' | 'provider';
    phone?: string;
    location?: string;
  }): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Services endpoints
  async getServices(params?: {
    category?: string;
    location?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/services?${queryString}` : '/services';
    
    return this.request(endpoint);
  }

  async getService(id: string): Promise<ApiResponse<any>> {
    return this.request(`/services/${id}`);
  }

  async createService(serviceData: {
    title: string;
    description: string;
    category: string;
    location: string;
    price: number;
    price_type: 'hourly' | 'fixed' | 'negotiable';
    images?: string[];
  }): Promise<ApiResponse<any>> {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  async updateService(id: string, serviceData: {
    title?: string;
    description?: string;
    category?: string;
    location?: string;
    price?: number;
    price_type?: 'hourly' | 'fixed' | 'negotiable';
    images?: string[];
  }): Promise<ApiResponse<any>> {
    return this.request(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(serviceData),
    });
  }

  async deleteService(id: string): Promise<ApiResponse<any>> {
    return this.request(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  // Service requests endpoints
  async getRequests(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/requests?${queryString}` : '/requests';
    
    return this.request(endpoint);
  }

  async createRequest(requestData: {
    service_id: string;
    message: string;
    requested_date: string;
    estimated_duration: number;
  }): Promise<ApiResponse<any>> {
    return this.request('/requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async updateRequestStatus(id: string, status: string): Promise<ApiResponse<any>> {
    return this.request(`/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Categories endpoints
  async getCategories(): Promise<ApiResponse<any[]>> {
    return this.request('/categories');
  }

  // Feedback endpoints
  async submitFeedback(feedbackData: {
    service_request_id: string;
    rating: number;
    comment: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  }

  async getProviderFeedback(providerId: string): Promise<ApiResponse<{
    feedback: any[];
    average_rating: number;
    total_reviews: number;
  }>> {
    return this.request(`/feedback/provider/${providerId}`);
  }

  // Profile endpoints
  async getProfile(): Promise<ApiResponse<any>> {
    return this.request('/profile');
  }

  async updateProfile(profileData: {
    name?: string;
    phone?: string;
    location?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
