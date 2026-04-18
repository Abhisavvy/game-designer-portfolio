/**
 * Enhanced error handling utilities for consistent error management
 * Provides user-friendly error messages and proper error categorization
 */

export type ErrorCategory = 'network' | 'validation' | 'authorization' | 'server' | 'client' | 'unknown';

export class AppError extends Error {
  public readonly category: ErrorCategory;
  public readonly originalError?: Error | unknown;
  public readonly statusCode?: number;
  public readonly retryable?: boolean;
  public readonly userMessage: string;

  constructor(
    message: string,
    category: ErrorCategory = 'unknown',
    originalError?: Error | unknown,
    statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
    this.category = category;
    this.originalError = originalError;
    this.statusCode = statusCode;
    
    let userMessage = message;
    let retryable = false;

    // Provide better user messages based on error category
    switch (category) {
      case 'network':
        userMessage = 'Network connection issue. Please check your internet connection and try again.';
        retryable = true;
        break;
      case 'validation':
        userMessage = 'Please check your input and try again.';
        break;
      case 'authorization':
        userMessage = 'You are not authorized to perform this action.';
        break;
      case 'server':
        userMessage = 'Server error occurred. Please try again in a moment.';
        retryable = true;
        break;
      case 'client':
        userMessage = message; // Use original message for client errors
        break;
    }

    this.userMessage = userMessage;
    this.retryable = retryable;
  }
}

/**
 * Creates a structured error object with user-friendly messaging
 */
export function createAppError(
  message: string,
  category: ErrorCategory = 'unknown',
  originalError?: Error | unknown,
  statusCode?: number
): AppError {
  return new AppError(message, category, originalError, statusCode);
}

/**
 * Categorizes errors based on common patterns
 */
export function categorizeError(error: unknown, statusCode?: number): ErrorCategory {
  if (statusCode) {
    if (statusCode >= 400 && statusCode < 500) {
      if (statusCode === 401 || statusCode === 403) return 'authorization';
      if (statusCode === 400 || statusCode === 422) return 'validation';
      return 'client';
    }
    if (statusCode >= 500) return 'server';
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'network';
    }
    
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return 'validation';
    }
    
    if (message.includes('unauthorized') || message.includes('forbidden')) {
      return 'authorization';
    }
  }

  return 'unknown';
}

/**
 * Enhanced fetch wrapper with better error handling
 */
export async function fetchWithErrorHandling(
  url: string,
  options?: RequestInit,
  timeout: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const category = categorizeError(null, response.status);
      let errorMessage = `Request failed with status ${response.status}`;
      
      // Try to get error message from response
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // Ignore JSON parsing errors
      }

      throw createAppError(errorMessage, category, null, response.status);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof AppError) {
      throw error;
    }

    if (controller.signal.aborted) {
      throw createAppError('Request timeout', 'network', error);
    }

    const category = categorizeError(error);
    throw createAppError(
      error instanceof Error ? error.message : 'Unknown error',
      category,
      error
    );
  }
}

/**
 * Safely executes an async function with error handling
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback?: T,
  onError?: (error: AppError) => void
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    const appError = error instanceof AppError 
      ? error 
      : createAppError(
          error instanceof Error ? error.message : 'Unknown error',
          categorizeError(error),
          error
        );

    console.error('Safe async error:', appError);
    
    if (onError) {
      onError(appError);
    }

    return fallback;
  }
}

/**
 * Creates user-friendly error messages for common API operations
 */
export const ErrorMessages = {
  LOAD_FAILED: (resource: string) => `Failed to load ${resource}. Please try again.`,
  SAVE_FAILED: (resource: string) => `Failed to save ${resource}. Please check your input and try again.`,
  DELETE_FAILED: (resource: string) => `Failed to delete ${resource}. Please try again.`,
  UPLOAD_FAILED: (type: string) => `Failed to upload ${type}. Please check the file and try again.`,
  NETWORK_ERROR: 'Network connection issue. Please check your internet connection.',
  SERVER_ERROR: 'Server error occurred. Please try again in a moment.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  GENERIC: 'An unexpected error occurred. Please try again.',
} as const;

/**
 * Error reporter for logging errors in production
 */
export function reportError(error: AppError, context?: Record<string, unknown>) {
  // In development, just log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error reported:', {
      ...error,
      context,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // In production, you would send this to your error reporting service
  // Example: Sentry, LogRocket, Bugsnag, etc.
  try {
    // Example implementation:
    // errorReportingService.captureException(error.originalError || new Error(error.message), {
    //   extra: { context, appError: error },
    //   tags: { category: error.category }
    // });
  } catch (reportingError) {
    console.error('Failed to report error:', reportingError);
  }
}