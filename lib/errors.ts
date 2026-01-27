/**
 * Centralized Error Handling Framework
 * 
 * This module provides:
 * - Custom error classes for different error types
 * - Error codes for consistent error identification
 * - Helper functions for error handling in server actions
 * - Type-safe error responses
 */

// Error codes for consistent identification
export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  QUERY_FAILED: 'QUERY_FAILED',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  
  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

// User-friendly error messages
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCodes.UNAUTHORIZED]: 'You must be logged in to perform this action.',
  [ErrorCodes.FORBIDDEN]: 'You do not have permission to perform this action.',
  [ErrorCodes.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorCodes.INVALID_CREDENTIALS]: 'Invalid credentials provided.',
  [ErrorCodes.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCodes.INVALID_INPUT]: 'The provided input is invalid.',
  [ErrorCodes.MISSING_REQUIRED_FIELD]: 'Please fill in all required fields.',
  [ErrorCodes.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCodes.ALREADY_EXISTS]: 'A resource with this identifier already exists.',
  [ErrorCodes.CONFLICT]: 'This operation conflicts with existing data.',
  [ErrorCodes.DATABASE_ERROR]: 'A database error occurred. Please try again.',
  [ErrorCodes.QUERY_FAILED]: 'Failed to retrieve data. Please try again.',
  [ErrorCodes.INTERNAL_ERROR]: 'An unexpected error occurred. Please try again.',
  [ErrorCodes.CONFIGURATION_ERROR]: 'Server configuration error. Please contact support.',
  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 'External service unavailable. Please try again later.',
  [ErrorCodes.RATE_LIMITED]: 'Too many requests. Please wait before trying again.',
}

// Base application error class
export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly details?: Record<string, unknown>

  constructor(
    code: ErrorCode,
    message?: string,
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message || ErrorMessages[code])
    this.code = code
    this.statusCode = statusCode
    this.isOperational = true
    this.details = details
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor)
  }
}

// Specific error classes
export class AuthenticationError extends AppError {
  constructor(message?: string, code: ErrorCode = ErrorCodes.UNAUTHORIZED) {
    super(code, message, 401)
  }
}

export class AuthorizationError extends AppError {
  constructor(message?: string, details?: Record<string, unknown>) {
    super(ErrorCodes.FORBIDDEN, message, 403, details)
  }
}

export class ValidationError extends AppError {
  constructor(message?: string, details?: Record<string, unknown>) {
    super(ErrorCodes.VALIDATION_ERROR, message, 400, details)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(ErrorCodes.NOT_FOUND, `${resource} not found.`, 404)
  }
}

export class ConflictError extends AppError {
  constructor(message?: string) {
    super(ErrorCodes.ALREADY_EXISTS, message, 409)
  }
}

export class DatabaseError extends AppError {
  constructor(message?: string) {
    super(ErrorCodes.DATABASE_ERROR, message, 500)
  }
}

// Type for action results (success or error)
export type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string; code: ErrorCode; details?: Record<string, unknown> }

// Helper to create success result
export function success<T>(data: T): ActionResult<T> {
  return { success: true, data }
}

// Helper to create error result
export function failure(
  error: string | AppError,
  code: ErrorCode = ErrorCodes.INTERNAL_ERROR,
  details?: Record<string, unknown>
): ActionResult<never> {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
    }
  }
  return { success: false, error, code, details }
}

// Helper to handle errors in server actions
export function handleActionError(error: unknown): ActionResult<never> {
  console.error('Action error:', error)
  
  if (error instanceof AppError) {
    return failure(error)
  }
  
  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.includes('Unauthorized') || error.message.includes('not logged in')) {
      return failure(ErrorMessages[ErrorCodes.UNAUTHORIZED], ErrorCodes.UNAUTHORIZED)
    }
    if (error.message.includes('already exists')) {
      return failure(error.message, ErrorCodes.ALREADY_EXISTS)
    }
    if (error.message.includes('not found')) {
      return failure(error.message, ErrorCodes.NOT_FOUND)
    }
    
    // Return the error message for known errors
    return failure(error.message, ErrorCodes.INTERNAL_ERROR)
  }
  
  // Unknown error type
  return failure(ErrorMessages[ErrorCodes.INTERNAL_ERROR], ErrorCodes.INTERNAL_ERROR)
}

// Validation helpers
export function validateRequired(
  fields: Record<string, unknown>,
  requiredFields: string[]
): void {
  const missing = requiredFields.filter(field => {
    const value = fields[field]
    return value === undefined || value === null || value === ''
  })
  
  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missing.join(', ')}`,
      { missingFields: missing }
    )
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  // Basic phone validation - allows various formats
  const phoneRegex = /^[\d\s\-+()]{10,}$/
  return phoneRegex.test(phone)
}
