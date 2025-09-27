/**
 * API Service Layer for LinkLocal Backend
 * Handles all HTTP requests to the backend API
 */

import { JWTUtils, TokenStorage, TokenPair } from './jwt';

const API_BASE_URL = 'https://technobytes-backend-2.onrender.com';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message: string | null;
  error: string | null;
}

// Error categorization utility
export const categorizeError = (error: Error): { category: string; userMessage: string } => {
  const message = error.message.toLowerCase();
  
  // Network-related errors
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return {
      category: 'network',
      userMessage: 'Unable to connect to the server. Please check your internet connection and try again.'
    };
  }
  
  // Authentication errors
  if (message.includes('invalid credentials') || message.includes('unauthorized') || message.includes('401')) {
    return {
      category: 'auth',
      userMessage: 'Invalid email or password. Please check your credentials and try again.'
    };
  }
  
  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return {
      category: 'validation',
      userMessage: 'Please check your input and try again. ' + error.message
    };
  }
  
  // Conflict errors (e.g., email already exists)
  if (message.includes('already exists') || message.includes('conflict') || message.includes('409') || 
      message.includes('email') && message.includes('taken')) {
    return {
      category: 'conflict',
      userMessage: 'This email is already registered. Please use a different email or try logging in.'
    };
  }
  
  // Server errors
  if (message.includes('server error') || message.includes('500') || message.includes('502') || message.includes('503')) {
    return {
      category: 'server',
      userMessage: 'Server is temporarily unavailable. Please try again in a few minutes.'
    };
  }
  
  // Rate limiting
  if (message.includes('too many') || message.includes('rate limit') || message.includes('429')) {
    return {
      category: 'rate_limit',
      userMessage: 'Too many requests. Please wait a moment before trying again.'
    };
  }
  
  // Default case - return the original message
  return {
    category: 'unknown',
    userMessage: error.message
  };
};

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
  private refreshPromise: Promise<string> | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  public setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    TokenStorage.setTokens(accessToken, refreshToken, expiresIn);
  }

  public clearTokens(): void {
    TokenStorage.clearTokens();
  }

  public getAccessToken(): string | null {
    return TokenStorage.getAccessToken();
  }

  public getRefreshToken(): string | null {
    return TokenStorage.getRefreshToken();
  }

  public isTokenValid(): boolean {
    const token = this.getAccessToken();
    return token ? JWTUtils.isTokenValid(token) : false;
  }

  public isTokenExpiringSoon(minutes: number = 5): boolean {
    return TokenStorage.isAccessTokenExpiringSoon(minutes);
  }

  /**
   * Refresh the access token using the refresh token
   */
  private async refreshAccessToken(): Promise<string> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    if (JWTUtils.isTokenExpired(refreshToken)) {
      this.clearTokens();
      throw new Error('Refresh token has expired. Please log in again.');
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const { access_token, refresh_token, expires_in } = data.data;
        
        // Update stored tokens
        this.setTokens(access_token, refresh_token, expires_in);
        
        return access_token;
      } else {
        throw new Error(data.message || 'Failed to refresh token');
      }
    } catch (error) {
      // Clear tokens on refresh failure
      this.clearTokens();
      throw error;
    }
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

    // Get current access token
    let accessToken = this.getAccessToken();
    
    // If we have a token, check if it needs refreshing
    if (accessToken) {
      // If token is expired or expiring soon, try to refresh it
      if (this.isTokenExpiringSoon(5)) { // Refresh if expiring within 5 minutes
        try {
          accessToken = await this.refreshAccessToken();
        } catch (error) {
          // If refresh fails, clear tokens and dispatch event
          this.clearTokens();
          localStorage.removeItem('sa_services_user');
          window.dispatchEvent(new CustomEvent('tokenExpired'));
          throw new Error('Your session has expired. Please log in again.');
        }
      }
      
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response is not JSON, create a structured error response
        data = {
          success: false,
          message: `Server error (${response.status})`,
          error: `HTTP ${response.status}: ${response.statusText}`,
          data: null
        };
      }

      if (!response.ok) {
        // Handle 401 Unauthorized (invalid token) specially
        if (response.status === 401) {
          // Try to refresh the token if we haven't already tried
          const refreshToken = this.getRefreshToken();
          if (refreshToken && !JWTUtils.isTokenExpired(refreshToken)) {
            try {
              const newAccessToken = await this.refreshAccessToken();
              // Retry the request with the new token
              return this.request(endpoint, {
                ...options,
                headers: {
                  ...headers,
                  "Authorization": `Bearer ${newAccessToken}`
                }
              });
            } catch (refreshError) {
              // Refresh failed, clear tokens and logout
              this.clearTokens();
              localStorage.removeItem('sa_services_user');
              window.dispatchEvent(new CustomEvent('tokenExpired'));
              throw new Error('Your session has expired. Please log in again.');
            }
          } else {
            // No refresh token or refresh token expired
            this.clearTokens();
            localStorage.removeItem('sa_services_user');
            window.dispatchEvent(new CustomEvent('tokenExpired'));
            throw new Error('Your session has expired. Please log in again.');
          }
        }
        
        // Provide more specific error messages based on status codes
        let errorMessage = data.message || data.error;
        
        if (!errorMessage) {
          switch (response.status) {
            case 400:
              errorMessage = 'Invalid request. Please check your input and try again.';
              break;
            case 403:
              errorMessage = 'Access denied. You do not have permission to perform this action.';
              break;
            case 404:
              errorMessage = 'The requested resource was not found.';
              break;
            case 409:
              errorMessage = 'A conflict occurred. This email may already be registered.';
              break;
            case 422:
              errorMessage = 'Validation failed. Please check your input and try again.';
              break;
            case 429:
              errorMessage = 'Too many requests. Please wait a moment and try again.';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            case 502:
            case 503:
            case 504:
              errorMessage = 'Service temporarily unavailable. Please try again later.';
              break;
            default:
              errorMessage = `Request failed with status ${response.status}`;
          }
        }

        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // Handle network errors and other fetch failures
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      // Handle timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      
      // Re-throw other errors as-is
      throw error;
    }
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<ApiResponse<{ 
    access_token: string; 
    refresh_token: string; 
    expires_in: number; 
    user: any 
  }>> {
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
  }): Promise<ApiResponse<{ 
    access_token: string; 
    refresh_token: string; 
    expires_in: number; 
    user: any 
  }>> {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Refresh token endpoint
  async refreshToken(refreshToken: string): Promise<ApiResponse<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }>> {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
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
