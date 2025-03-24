/**
 * Validators for input and output data
 */

import { z } from 'zod';

/**
 * Options for validation
 */
export interface ValidationOptions {
  /**
   * Whether to strip unknown properties from objects
   */
  stripUnknown?: boolean;
  /**
   * Custom error messages
   */
  errorMap?: z.ZodErrorMap;
  /**
   * Custom message for when validation fails
   */
  errorMessage?: string;
}

/**
 * Validate data against a zod schema with helpful error messages
 */
export function validateWithZod<T>(
  data: unknown,
  schema: z.ZodType<T>,
  options: ValidationOptions = {}
): { success: boolean; data?: T; errors?: string[] } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => {
        // Create a more readable path
        const path = err.path.join('.');
        const prefix = path ? `${path}: ` : '';
        return `${prefix}${err.message}`;
      });
      
      return {
        success: false,
        errors,
      };
    }
    
    return {
      success: false,
      errors: [options.errorMessage || 'Validation failed: Unknown error'],
    };
  }
}

/**
 * Basic sanitization of user input to prevent XSS and other injection attacks
 */
export function sanitizeUserInput(input: string): string {
  // Replace potentially harmful HTML characters
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Schema for validating API responses
 */
export const apiResponseSchema = z.object({
  status: z.enum(['success', 'error']),
  data: z.any().optional(),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
  }).optional(),
});

/**
 * Schema for validating paginated API responses
 */
export const paginatedApiResponseSchema = z.object({
  status: z.enum(['success', 'error']),
  data: z.object({
    items: z.array(z.any()),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
  }).optional(),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
  }).optional(),
});

/**
 * Schema for validating AI model responses
 */
export const aiModelResponseSchema = z.object({
  content: z.string(),
  toolCalls: z.array(z.object({
    name: z.string(),
    parameters: z.record(z.any()),
  })).optional(),
  metadata: z.object({
    usage: z.object({
      promptTokens: z.number().optional(),
      completionTokens: z.number().optional(),
      totalTokens: z.number().optional(),
    }).optional(),
    model: z.string().optional(),
    finishReason: z.string().optional(),
  }).optional(),
});

/**
 * Validate a value to ensure it's a valid JSON string
 */
export function validateJson(value: string): { 
  valid: boolean; 
  data?: any; 
  error?: string; 
} {
  try {
    const parsed = JSON.parse(value);
    return { valid: true, data: parsed };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid JSON',
    };
  }
}

/**
 * Validate a URL string
 */
export function validateUrl(url: string): { 
  valid: boolean; 
  url?: URL; 
  error?: string; 
} {
  try {
    const parsedUrl = new URL(url);
    return { valid: true, url: parsedUrl };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid URL',
    };
  }
}

/**
 * Validate email address format
 */
export function validateEmail(email: string): { 
  valid: boolean; 
  error?: string; 
} {
  // Basic email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isValid = emailRegex.test(email);
  
  return {
    valid: isValid,
    error: isValid ? undefined : 'Invalid email address format',
  };
}

/**
 * Create a simple validation chain for common data types
 */
export class Validator {
  private value: any;
  private errors: string[] = [];
  private isValid = true;
  
  constructor(value: any) {
    this.value = value;
  }
  
  /**
   * Check if the value is not empty
   */
  notEmpty(message = 'Value cannot be empty'): Validator {
    if (this.isValid) {
      if (this.value === null || this.value === undefined || this.value === '') {
        this.isValid = false;
        this.errors.push(message);
      }
    }
    return this;
  }
  
  /**
   * Check if the value is a string
   */
  isString(message = 'Value must be a string'): Validator {
    if (this.isValid) {
      if (typeof this.value !== 'string') {
        this.isValid = false;
        this.errors.push(message);
      }
    }
    return this;
  }
  
  /**
   * Check if the value is a number
   */
  isNumber(message = 'Value must be a number'): Validator {
    if (this.isValid) {
      if (typeof this.value !== 'number' || isNaN(this.value)) {
        this.isValid = false;
        this.errors.push(message);
      }
    }
    return this;
  }
  
  /**
   * Check if the value is a boolean
   */
  isBoolean(message = 'Value must be a boolean'): Validator {
    if (this.isValid) {
      if (typeof this.value !== 'boolean') {
        this.isValid = false;
        this.errors.push(message);
      }
    }
    return this;
  }
  
  /**
   * Check if the value is an array
   */
  isArray(message = 'Value must be an array'): Validator {
    if (this.isValid) {
      if (!Array.isArray(this.value)) {
        this.isValid = false;
        this.errors.push(message);
      }
    }
    return this;
  }
  
  /**
   * Check if the value is an object
   */
  isObject(message = 'Value must be an object'): Validator {
    if (this.isValid) {
      if (typeof this.value !== 'object' || this.value === null || Array.isArray(this.value)) {
        this.isValid = false;
        this.errors.push(message);
      }
    }
    return this;
  }
  
  /**
   * Check if the value matches a regex pattern
   */
  matches(pattern: RegExp, message = 'Value does not match the required pattern'): Validator {
    if (this.isValid) {
      if (typeof this.value !== 'string' || !pattern.test(this.value)) {
        this.isValid = false;
        this.errors.push(message);
      }
    }
    return this;
  }
  
  /**
   * Check if the value is at least the minimum length
   */
  minLength(length: number, message?: string): Validator {
    if (this.isValid) {
      if (typeof this.value !== 'string' || this.value.length < length) {
        this.isValid = false;
        this.errors.push(message || `Value must be at least ${length} characters`);
      }
    }
    return this;
  }
  
  /**
   * Check if the value is at most the maximum length
   */
  maxLength(length: number, message?: string): Validator {
    if (this.isValid) {
      if (typeof this.value !== 'string' || this.value.length > length) {
        this.isValid = false;
        this.errors.push(message || `Value must be at most ${length} characters`);
      }
    }
    return this;
  }
  
  /**
   * Get the validation result
   */
  get result(): { valid: boolean; errors: string[] } {
    return {
      valid: this.isValid,
      errors: this.errors,
    };
  }
}

/**
 * Create a new validator for a value
 */
export function validate(value: any): Validator {
  return new Validator(value);
}