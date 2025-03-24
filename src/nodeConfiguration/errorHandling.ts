/**
 * Error handling utilities for AI nodes
 */

import { BaseError } from '@modelcontextprotocol/sdk';

/**
 * Different types of errors that can occur in AI nodes
 */
export enum AiErrorType {
  // Connection errors
  CONNECTION_ERROR = 'connection_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  
  // Model errors
  MODEL_NOT_FOUND = 'model_not_found',
  INVALID_MODEL_PARAMETERS = 'invalid_model_parameters',
  CONTEXT_WINDOW_EXCEEDED = 'context_window_exceeded',
  TOKEN_LIMIT_EXCEEDED = 'token_limit_exceeded',
  
  // Content policy errors
  CONTENT_FILTERED = 'content_filtered',
  CONTENT_POLICY_VIOLATION = 'content_policy_violation',
  
  // Tool errors
  TOOL_EXECUTION_ERROR = 'tool_execution_error',
  TOOL_NOT_FOUND = 'tool_not_found',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  QUOTA_EXCEEDED = 'quota_exceeded',
  
  // Server errors
  SERVER_ERROR = 'server_error',
  TIMEOUT_ERROR = 'timeout_error',
  
  // Validation errors
  VALIDATION_ERROR = 'validation_error',
  
  // Unknown
  UNKNOWN_ERROR = 'unknown_error',
}

/**
 * Custom error class for AI node errors
 */
export class AiNodeError extends BaseError {
  type: AiErrorType;
  statusCode?: number;
  retryable: boolean;
  
  constructor(message: string, options: {
    type: AiErrorType,
    statusCode?: number,
    retryable?: boolean,
    cause?: Error,
  }) {
    super(message, { cause: options.cause });
    this.type = options.type;
    this.statusCode = options.statusCode;
    this.retryable = options.retryable ?? false;
    this.name = 'AiNodeError';
  }
}

/**
 * Determines if an error is a connection error
 */
export function isConnectionError(error: AiNodeError): boolean {
  return [
    AiErrorType.CONNECTION_ERROR,
    AiErrorType.AUTHENTICATION_ERROR,
  ].includes(error.type);
}

/**
 * Determines if an error is a model-related error
 */
export function isModelError(error: AiNodeError): boolean {
  return [
    AiErrorType.MODEL_NOT_FOUND,
    AiErrorType.INVALID_MODEL_PARAMETERS, 
    AiErrorType.CONTEXT_WINDOW_EXCEEDED,
    AiErrorType.TOKEN_LIMIT_EXCEEDED,
  ].includes(error.type);
}

/**
 * Determines if an error is a content policy violation
 */
export function isContentPolicyError(error: AiNodeError): boolean {
  return [
    AiErrorType.CONTENT_FILTERED,
    AiErrorType.CONTENT_POLICY_VIOLATION,
  ].includes(error.type);
}

/**
 * Determines if an error is a tool-related error
 */
export function isToolError(error: AiNodeError): boolean {
  return [
    AiErrorType.TOOL_EXECUTION_ERROR,
    AiErrorType.TOOL_NOT_FOUND,
  ].includes(error.type);
}

/**
 * Determines if an error is a rate limiting error
 */
export function isRateLimitError(error: AiNodeError): boolean {
  return [
    AiErrorType.RATE_LIMIT_EXCEEDED,
    AiErrorType.QUOTA_EXCEEDED,
  ].includes(error.type);
}

/**
 * Determines if an error is a server error
 */
export function isServerError(error: AiNodeError): boolean {
  return [
    AiErrorType.SERVER_ERROR,
    AiErrorType.TIMEOUT_ERROR,
  ].includes(error.type);
}

/**
 * Creates an error handler that can be used with LangChain
 * 
 * @param logger Optional logger for logging errors
 * @returns An error handler function
 */
export function createErrorHandler(logger?: Console) {
  return async (e: Error, attemptNumber: number): Promise<boolean> => {
    // If it's already our custom error, just pass it through
    if (e instanceof AiNodeError) {
      if (logger) {
        logger.error(`AI Node Error (attempt ${attemptNumber}): ${e.message}`, {
          type: e.type,
          statusCode: e.statusCode,
          retryable: e.retryable
        });
      }
      return e.retryable;
    }
    
    // Try to parse common API error patterns
    const isRateLimitError = e.message.includes('rate limit') || 
                            e.message.includes('too many requests') ||
                            /429|too many/i.test(e.message);
                            
    const isServerError = e.message.includes('server error') || 
                         e.message.includes('internal error') ||
                         /5[0-9][0-9]|internal|server/i.test(e.message);
                         
    const isTimeoutError = e.message.includes('timeout') || 
                          e.message.includes('timed out') ||
                          /timeout|timed out/i.test(e.message);
    
    if (logger) {
      logger.error(`AI Error (attempt ${attemptNumber}): ${e.message}`);
    }
    
    // Only retry rate limit, server, and timeout errors
    return isRateLimitError || isServerError || isTimeoutError;
  };
}