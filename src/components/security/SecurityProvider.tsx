import React, { createContext, useContext, useEffect } from 'react';
import { SecurityUtils } from '@/lib/security';

interface SecurityContextType {
  logSecurityEvent: (event: string, details?: any) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  useEffect(() => {
    // Set up Content Security Policy headers (client-side enforcement)
    // Note: This is a development-friendly CSP. In production, you should set CSP headers on the server
    // and remove 'unsafe-eval' and 'unsafe-inline' for better security
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    
    const cspDirectives = [
      "default-src 'self'",
      `script-src 'self'${isDevelopment ? " 'unsafe-eval' 'unsafe-inline'" : ""}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "media-src 'self'"
    ];
    
    meta.content = cspDirectives.join('; ');
    document.head.appendChild(meta);

    // Add security headers via meta tags (limited client-side security)
    const securityHeaders = [
      { name: 'X-Content-Type-Options', content: 'nosniff' },
      { name: 'X-Frame-Options', content: 'DENY' },
      { name: 'X-XSS-Protection', content: '1; mode=block' },
      { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
    ];

    securityHeaders.forEach(({ name, content }) => {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
    });

    // Log security initialization
    SecurityUtils.logSecurityEvent('SECURITY_PROVIDER_INITIALIZED', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      location: window.location.href
    });

    // Set up global error handler for security events
    const handleError = (event: ErrorEvent) => {
      // Don't log CSP violations as security events to avoid spam
      if (event.message && event.message.includes('Content Security Policy')) {
        console.warn('CSP Violation (non-critical):', event.message);
        return;
      }
      
      SecurityUtils.logSecurityEvent('CLIENT_ERROR', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.toString()
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Don't log CSP-related promise rejections
      if (event.reason && event.reason.toString().includes('Content Security Policy')) {
        console.warn('CSP-related promise rejection (non-critical):', event.reason);
        return;
      }
      
      SecurityUtils.logSecurityEvent('UNHANDLED_PROMISE_REJECTION', {
        reason: event.reason
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const logSecurityEvent = (event: string, details?: any) => {
    SecurityUtils.logSecurityEvent(event, details);
  };

  const value: SecurityContextType = {
    logSecurityEvent
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};