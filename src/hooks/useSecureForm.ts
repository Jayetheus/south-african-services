import { useState, useCallback } from 'react';
import { z } from 'zod';
import { SecurityUtils } from '@/lib/security';
import { categorizeError } from '@/lib/api';

interface UseSecureFormOptions<T> {
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<void> | void;
  rateLimiter?: {
    isAllowed: (identifier: string) => boolean;
    getBlockedTimeRemaining: (identifier: string) => number;
  };
  identifier?: string; // For rate limiting (e.g., email, IP)
}

interface FormState {
  isSubmitting: boolean;
  errors: Record<string, string>;
  isBlocked: boolean;
  blockTimeRemaining: number;
}

export function useSecureForm<T>({
  schema,
  onSubmit,
  rateLimiter,
  identifier = 'default'
}: UseSecureFormOptions<T>) {
  const [formState, setFormState] = useState<FormState>({
    isSubmitting: false,
    errors: {},
    isBlocked: false,
    blockTimeRemaining: 0
  });

  const validateAndSubmit = useCallback(async (data: unknown) => {
    // Reset previous errors
    setFormState(prev => ({ ...prev, errors: {} }));

    // Check rate limiting
    if (rateLimiter && !rateLimiter.isAllowed(identifier)) {
      const timeRemaining = rateLimiter.getBlockedTimeRemaining(identifier);
      setFormState(prev => ({
        ...prev,
        isBlocked: true,
        blockTimeRemaining: timeRemaining,
        errors: {
          submit: `Too many attempts. Please try again in ${timeRemaining} minutes.`
        }
      }));
      
      SecurityUtils.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
        identifier,
        timeRemaining
      });
      return;
    }

    // Validate input data
    try {
      const validatedData = schema.parse(data);
      
      setFormState(prev => ({ ...prev, isSubmitting: true }));
      
      await onSubmit(validatedData);
      
      setFormState(prev => ({ 
        ...prev, 
        isSubmitting: false,
        isBlocked: false,
        blockTimeRemaining: 0
      }));
      
    } catch (error) {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
      
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          const fieldName = err.path.join('.');
          fieldErrors[fieldName] = err.message;
        });
        
        setFormState(prev => ({ ...prev, errors: fieldErrors }));
        
        SecurityUtils.logSecurityEvent('VALIDATION_ERROR', {
          errors: error.issues,
          identifier
        });
      } else {
        // Handle other errors - show the specific error message with categorization
        const errorMessage = error instanceof Error ? error.message : 'An error occurred. Please try again.';
        const { userMessage } = categorizeError(error instanceof Error ? error : new Error(errorMessage));
        
        setFormState(prev => ({
          ...prev,
          errors: { submit: userMessage }
        }));
        
        SecurityUtils.logSecurityEvent('FORM_SUBMIT_ERROR', {
          error: errorMessage,
          identifier
        });
      }
    }
  }, [schema, onSubmit, rateLimiter, identifier]);

  const getFieldError = useCallback((fieldName: string): string | undefined => {
    return formState.errors[fieldName];
  }, [formState.errors]);

  const hasErrors = Object.keys(formState.errors).length > 0;

  return {
    ...formState,
    validateAndSubmit,
    getFieldError,
    hasErrors
  };
}