/**
 * Formatters for preparing data for display or transmission
 */

/**
 * Options for formatting values
 */
export interface FormattingOptions {
  /**
   * Number of decimal places for formatting numbers
   */
  decimals?: number;
  /**
   * Date format string
   */
  dateFormat?: string;
  /**
   * Whether to include time in date formatting
   */
  includeTime?: boolean;
  /**
   * Locale string for number and date formatting
   */
  locale?: string;
  /**
   * Length to truncate strings to
   */
  truncateLength?: number;
  /**
   * String to append to truncated strings
   */
  truncationSuffix?: string;
}

/**
 * Format a value based on its type and provided options
 */
export function formatValue(
  value: any,
  options: FormattingOptions = {}
): string {
  if (value === null || value === undefined) {
    return '';
  }

  // Default options
  const opts = {
    decimals: 2,
    dateFormat: 'short',
    includeTime: false,
    locale: 'en-US',
    truncateLength: 100,
    truncationSuffix: '...',
    ...options,
  };

  // Format based on type
  if (typeof value === 'number') {
    return formatNumber(value, opts);
  } else if (value instanceof Date) {
    return formatDate(value, opts);
  } else if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  } else if (typeof value === 'string') {
    return formatString(value, opts);
  } else if (Array.isArray(value)) {
    return formatArray(value, opts);
  } else if (typeof value === 'object') {
    return formatObject(value, opts);
  }

  // Default: convert to string
  return String(value);
}

/**
 * Format a number with the specified options
 */
export function formatNumber(
  value: number,
  options: FormattingOptions = {}
): string {
  const opts = {
    decimals: 2,
    locale: 'en-US',
    ...options,
  };

  return value.toLocaleString(opts.locale, {
    minimumFractionDigits: opts.decimals,
    maximumFractionDigits: opts.decimals,
  });
}

/**
 * Format a date with the specified options
 */
export function formatDate(
  value: Date,
  options: FormattingOptions = {}
): string {
  const opts = {
    dateFormat: 'short',
    includeTime: false,
    locale: 'en-US',
    ...options,
  };

  const dateOptions: Intl.DateTimeFormatOptions = {};

  // Set date style based on format
  if (opts.dateFormat === 'short') {
    dateOptions.dateStyle = 'short';
  } else if (opts.dateFormat === 'medium') {
    dateOptions.dateStyle = 'medium';
  } else if (opts.dateFormat === 'long') {
    dateOptions.dateStyle = 'long';
  } else if (opts.dateFormat === 'full') {
    dateOptions.dateStyle = 'full';
  } else {
    dateOptions.year = 'numeric';
    dateOptions.month = 'numeric';
    dateOptions.day = 'numeric';
  }

  // Add time if requested
  if (opts.includeTime) {
    dateOptions.timeStyle = 'short';
  }

  return new Intl.DateTimeFormat(opts.locale, dateOptions as any).format(value);
}

/**
 * Format a string with the specified options
 */
export function formatString(
  value: string,
  options: FormattingOptions = {}
): string {
  const opts = {
    truncateLength: 100,
    truncationSuffix: '...',
    ...options,
  };

  // Truncate if necessary
  if (opts.truncateLength && value.length > opts.truncateLength) {
    return value.substring(0, opts.truncateLength) + opts.truncationSuffix;
  }

  return value;
}

/**
 * Format an array as a string with the specified options
 */
export function formatArray(
  value: any[],
  options: FormattingOptions = {}
): string {
  // Format each item in the array
  const formattedItems = value.map(item => formatValue(item, options));
  
  // Join with commas
  return formattedItems.join(', ');
}

/**
 * Format an object as a string with the specified options
 */
export function formatObject(
  value: Record<string, any>,
  options: FormattingOptions = {}
): string {
  try {
    // Try to pretty print as JSON with indentation
    return JSON.stringify(value, null, 2);
  } catch (e) {
    // Fallback to basic string representation
    return String(value);
  }
}

/**
 * Format a byte size into a human-readable string
 */
export function formatByteSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format a duration in milliseconds to a human-readable string
 */
export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
  }
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  
  return `${seconds}s`;
}

/**
 * Format a percentage value with the specified precision
 */
export function formatPercentage(
  value: number,
  decimals: number = 1
): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a currency value with the specified options
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format a value for use in CSV files, escaping special characters
 */
export function formatForCsv(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // Escape quotes and wrap in quotes if it contains special characters
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Format a phone number to a standardized format
 */
export function formatPhoneNumber(
  phoneNumber: string,
  countryCode: string = '1'
): string {
  // Remove all non-numeric characters
  const digitsOnly = phoneNumber.replace(/\\D/g, '');
  
  // Handle US/Canada phone numbers (default)
  if (countryCode === '1' && digitsOnly.length === 10) {
    return `(${digitsOnly.substring(0, 3)}) ${digitsOnly.substring(3, 6)}-${digitsOnly.substring(6)}`;
  }
  
  // For international numbers, add the + prefix and country code
  if (digitsOnly.length > 0) {
    if (digitsOnly.startsWith(countryCode)) {
      return `+${digitsOnly}`;
    } else {
      return `+${countryCode}${digitsOnly}`;
    }
  }
  
  // Return the original if we can't format it
  return phoneNumber;
}