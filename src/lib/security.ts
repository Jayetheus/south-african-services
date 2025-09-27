import DOMPurify from 'dompurify';
import { z } from 'zod';

// ==================== INPUT VALIDATION SCHEMAS ====================

// Email validation with enhanced security
export const emailSchema = z
  .string()
  .trim()
  .email({ message: "Invalid email address" })
  .max(255, { message: "Email must be less than 255 characters" })
  .refine((email) => {
    // Additional email security checks
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /onload/i,
      /onerror/i
    ];
    return !suspiciousPatterns.some(pattern => pattern.test(email));
  }, { message: "Email contains suspicious content" });

// Password validation with reasonable security requirements
export const passwordSchema = z
  .string()
  .min(6, { message: "Password must be at least 6 characters" })
  .max(128, { message: "Password must be less than 128 characters" })
  .refine((password) => {
    // Check for very common weak passwords only
    const weakPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    return !weakPasswords.includes(password.toLowerCase());
  }, { message: "Password is too common" });

// Name validation with XSS prevention
export const nameSchema = z
  .string()
  .trim()
  .min(1, { message: "Name cannot be empty" })
  .max(100, { message: "Name must be less than 100 characters" })
  .regex(/^[a-zA-Z\s'-]+$/, {
    message: "Name can only contain letters, spaces, hyphens, and apostrophes"
  });

// Phone validation for South African numbers
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+27|0)[0-9]{9}$/, {
    message: "Please enter a valid South African phone number"
  });

// Service description validation
export const serviceDescriptionSchema = z
  .string()
  .trim()
  .min(10, { message: "Description must be at least 10 characters" })
  .max(1000, { message: "Description must be less than 1000 characters" })
  .refine((desc) => {
    // Check for HTML/script injection
    const dangerousPatterns = [
      /<script/i,
      /<iframe/i,
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /onload/i,
      /onerror/i,
      /onclick/i,
      /onmouseover/i
    ];
    return !dangerousPatterns.some(pattern => pattern.test(desc));
  }, { message: "Description contains potentially unsafe content" });

// Search query validation - less restrictive but still secure
export const searchQuerySchema = z
  .string()
  .trim()
  .min(1, { message: "Search query cannot be empty" })
  .max(100, { message: "Search query must be less than 100 characters" })
  .refine((query) => {
    // Only block obvious SQL injection attempts, not legitimate search terms
    const dangerousPatterns = [
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b).*(\bFROM\b|\bINTO\b|\bWHERE\b)/i,
      /['";].*(\bOR\b|\bAND\b)/i,
      /--.*\b(SELECT|INSERT|UPDATE|DELETE|DROP)\b/i,
      /\/\*.*\b(SELECT|INSERT|UPDATE|DELETE|DROP)\b/i
    ];
    return !dangerousPatterns.some(pattern => pattern.test(query));
  }, { message: "Search query contains potentially unsafe content" });

// ==================== XSS PREVENTION ====================

/**
 * Sanitizes HTML content to prevent XSS attacks
 * CSP-friendly configuration that doesn't use eval
 */
export const sanitizeHTML = (dirty: string): string => {
  try {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
      // Disable features that might trigger CSP violations
      SANITIZE_DOM: false,
      SANITIZE_NAMED_PROPS: false,
      // Use a more restrictive configuration
      FORBID_TAGS: ['script', 'object', 'embed', 'link', 'meta'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
    });
  } catch (error) {
    // Fallback to basic text sanitization if DOMPurify fails due to CSP
    console.warn('DOMPurify failed, using fallback sanitization:', error);
    return sanitizeText(dirty);
  }
};

/**
 * Sanitizes plain text input
 */
export const sanitizeText = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Encodes data for URL parameters
 */
export const encodeForURL = (data: string): string => {
  return encodeURIComponent(data);
};

// ==================== RATE LIMITING ====================

interface RateLimitEntry {
  count: number;
  lastAttempt: number;
  blocked: boolean;
}

class RateLimiter {
  private attempts = new Map<string, RateLimitEntry>();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly blockDurationMs: number;

  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000, blockDurationMs = 30 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.blockDurationMs = blockDurationMs;
  }

  /**
   * Check if an action is allowed for a given identifier
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    if (!entry) {
      this.attempts.set(identifier, {
        count: 1,
        lastAttempt: now,
        blocked: false
      });
      return true;
    }

    // Check if user is currently blocked
    if (entry.blocked && (now - entry.lastAttempt) < this.blockDurationMs) {
      return false;
    }

    // Reset if window has passed
    if ((now - entry.lastAttempt) > this.windowMs) {
      entry.count = 1;
      entry.lastAttempt = now;
      entry.blocked = false;
      return true;
    }

    // Increment counter
    entry.count++;
    entry.lastAttempt = now;

    // Block if exceeded max attempts
    if (entry.count > this.maxAttempts) {
      entry.blocked = true;
      return false;
    }

    return true;
  }

  /**
   * Get remaining time until unblocked (in minutes)
   */
  getBlockedTimeRemaining(identifier: string): number {
    const entry = this.attempts.get(identifier);
    if (!entry || !entry.blocked) return 0;

    const remainingMs = this.blockDurationMs - (Date.now() - entry.lastAttempt);
    return Math.ceil(remainingMs / (60 * 1000));
  }
}

// Create rate limiters for different actions
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000, 30 * 60 * 1000); // 5 attempts per 15 mins, block for 30 mins
export const searchRateLimiter = new RateLimiter(100, 60 * 1000, 5 * 60 * 1000); // 100 searches per minute, block for 5 mins
export const contactRateLimiter = new RateLimiter(3, 60 * 60 * 1000, 60 * 60 * 1000); // 3 contacts per hour, block for 1 hour

// ==================== SECURITY HEADERS ====================

/**
 * Security utility functions for client-side protection
 */
export const SecurityUtils = {
  /**
   * Generate a random nonce for CSP
   */
  generateNonce: (): string => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Validate file upload security
   */
  validateFileUpload: (file: File): { valid: boolean; error?: string } => {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { valid: false, error: "File size must be less than 5MB" };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: "File type not allowed" };
    }

    // Check file name for malicious patterns
    const fileName = file.name.toLowerCase();
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.js', '.jar'];
    if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
      return { valid: false, error: "File type not allowed" };
    }

    return { valid: true };
  },

  /**
   * Log security events (in production, send to monitoring service)
   */
  logSecurityEvent: (event: string, details: any = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details: {
        ...details,
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    };

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔒 Security Event:', logEntry);
    }

    // In production, you would send this to your monitoring service
    // Example: sendToMonitoringService(logEntry);
  }
};

// ==================== FORM VALIDATION SCHEMAS ====================

export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Password is required" })
});

export const registerFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  role: z.enum(['customer', 'provider'])
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const serviceRequestSchema = z.object({
  title: z.string().trim().min(5).max(100),
  description: serviceDescriptionSchema,
  category: z.string().min(1),
  budget: z.number().min(1).max(100000),
  location: z.string().trim().min(2).max(100)
});

export const profileUpdateSchema = z.object({
  name: nameSchema,
  phone: phoneSchema.optional(),
  location: z.string().trim().max(100).optional()
});