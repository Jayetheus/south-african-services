/**
 * JWT Token Utilities
 * Handles JWT token validation, decoding, and refresh token management
 */

export interface JWTPayload {
  sub: string; // user ID
  email: string;
  role: string;
  iat: number; // issued at
  exp: number; // expiration
  type: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until expiration
}

export class JWTUtils {
  /**
   * Decode JWT token without verification (client-side only)
   * In production, tokens should be verified server-side
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }

  /**
   * Check if a token is expired
   */
  static isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  }

  /**
   * Check if a token will expire within the given time (in minutes)
   */
  static isTokenExpiringSoon(token: string, minutes: number = 5): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true;

    const now = Math.floor(Date.now() / 1000);
    const expirationTime = payload.exp;
    const timeUntilExpiration = expirationTime - now;
    
    return timeUntilExpiration < (minutes * 60);
  }

  /**
   * Get time until token expiration in seconds
   */
  static getTimeUntilExpiration(token: string): number {
    const payload = this.decodeToken(token);
    if (!payload) return 0;

    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - now);
  }

  /**
   * Check if a token is valid (not expired and properly formatted)
   */
  static isTokenValid(token: string): boolean {
    if (!token || typeof token !== 'string') return false;
    
    const payload = this.decodeToken(token);
    if (!payload) return false;

    return !this.isTokenExpired(token);
  }

  /**
   * Extract user information from token
   */
  static getUserFromToken(token: string): { id: string; email: string; role: string } | null {
    const payload = this.decodeToken(token);
    if (!payload) return null;

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };
  }

  /**
   * Check if token is a refresh token
   */
  static isRefreshToken(token: string): boolean {
    const payload = this.decodeToken(token);
    return payload?.type === 'refresh';
  }

  /**
   * Check if token is an access token
   */
  static isAccessToken(token: string): boolean {
    const payload = this.decodeToken(token);
    return payload?.type === 'access';
  }
}

/**
 * Token storage utilities
 */
export class TokenStorage {
  private static readonly ACCESS_TOKEN_KEY = 'sa_services_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'sa_services_refresh_token';
  private static readonly TOKEN_EXPIRY_KEY = 'sa_services_token_expiry';

  static setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    const expiryTime = Date.now() + (expiresIn * 1000);
    
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static getTokenExpiry(): number | null {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    return expiry ? parseInt(expiry, 10) : null;
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }

  static isAccessTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    
    return JWTUtils.isTokenExpired(token);
  }

  static isAccessTokenExpiringSoon(minutes: number = 5): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    
    return JWTUtils.isTokenExpiringSoon(token, minutes);
  }
}
