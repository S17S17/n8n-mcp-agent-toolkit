/**
 * Adapters for converting between different data formats
 */

/**
 * Options for data adapter conversions
 */
export interface AdapterOptions {
  /**
   * Whether to preserve nullish values (null, undefined) or remove them
   */
  preserveNullish?: boolean;
  /**
   * Whether to preserve arrays or convert them to strings
   */
  preserveArrays?: boolean;
  /**
   * Custom transformers for specific types
   */
  transformers?: Record<string, (value: any) => any>;
  /**
   * Default value to use when encountering nullish values if preserveNullish is false
   */
  defaultValue?: any;
}

/**
 * Convert a JSON object to a flattened key-value record
 * 
 * @example
 * ```
 * // Input
 * {
 *   user: {
 *     name: 'John',
 *     address: {
 *       city: 'New York'
 *     }
 *   },
 *   items: ['a', 'b']
 * }
 * 
 * // Output (with defaults)
 * {
 *   'user.name': 'John',
 *   'user.address.city': 'New York',
 *   'items': 'a,b'
 * }
 * ```
 */
export function jsonToFlatRecord(
  json: Record<string, any>,
  options: AdapterOptions = {}
): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};
  const defaultOptions: AdapterOptions = {
    preserveNullish: false,
    preserveArrays: false,
    defaultValue: '',
    ...options,
  };

  function flatten(obj: any, prefix = ''): void {
    if (obj === null || obj === undefined) {
      if (defaultOptions.preserveNullish) {
        result[prefix] = obj as any;
      } else if (prefix) {
        result[prefix] = defaultOptions.defaultValue;
      }
      return;
    }

    if (typeof obj !== 'object') {
      if (prefix) {
        result[prefix] = obj;
      }
      return;
    }

    if (Array.isArray(obj)) {
      if (defaultOptions.preserveArrays) {
        result[prefix] = JSON.stringify(obj);
      } else {
        result[prefix] = obj.join(',');
      }
      return;
    }

    Object.entries(obj).forEach(([key, value]) => {
      const newPrefix = prefix ? `${prefix}.${key}` : key;

      // Handle custom transformers if provided
      if (defaultOptions.transformers && newPrefix in defaultOptions.transformers) {
        result[newPrefix] = defaultOptions.transformers[newPrefix](value);
        return;
      }

      if (value === null || value === undefined) {
        if (defaultOptions.preserveNullish) {
          result[newPrefix] = value as any;
        } else {
          result[newPrefix] = defaultOptions.defaultValue;
        }
        return;
      }

      if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0) {
        flatten(value, newPrefix);
      } else if (Array.isArray(value)) {
        if (defaultOptions.preserveArrays) {
          result[newPrefix] = JSON.stringify(value);
        } else {
          result[newPrefix] = value.join(',');
        }
      } else {
        result[newPrefix] = value;
      }
    });
  }

  flatten(json);
  return result;
}

/**
 * Convert a flattened key-value record back to a nested JSON object
 * 
 * @example
 * ```
 * // Input
 * {
 *   'user.name': 'John',
 *   'user.address.city': 'New York',
 *   'items': 'a,b'
 * }
 * 
 * // Output (with defaults)
 * {
 *   user: {
 *     name: 'John',
 *     address: {
 *       city: 'New York'
 *     }
 *   },
 *   items: 'a,b'
 * }
 * ```
 */
export function flatRecordToJson(
  record: Record<string, any>,
  options: AdapterOptions = {}
): Record<string, any> {
  const result: Record<string, any> = {};
  const defaultOptions: AdapterOptions = {
    preserveArrays: false,
    ...options,
  };

  Object.entries(record).forEach(([key, value]) => {
    if (key.includes('.')) {
      const parts = key.split('.');
      let current = result;

      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // Last part - set the value
          current[part] = value;
        } else {
          // Create nested object if it doesn't exist
          if (!current[part] || typeof current[part] !== 'object' || Array.isArray(current[part])) {
            current[part] = {};
          }
          current = current[part];
        }
      });
    } else {
      // Handle custom transformers if provided
      if (defaultOptions.transformers && key in defaultOptions.transformers) {
        result[key] = defaultOptions.transformers[key](value);
      } else {
        // Not a nested key
        result[key] = value;
      }
    }
  });

  return result;
}

/**
 * Convert an object to key-value pairs suitable for form data
 * 
 * @example
 * ```
 * // Input
 * {
 *   user: {
 *     name: 'John',
 *     age: 30
 *   },
 *   active: true
 * }
 * 
 * // Output
 * [
 *   { key: 'user[name]', value: 'John' },
 *   { key: 'user[age]', value: 30 },
 *   { key: 'active', value: true }
 * ]
 * ```
 */
export function objectToKeyValuePairs(
  obj: Record<string, any>,
  options: AdapterOptions = {}
): Array<{ key: string; value: any }> {
  const result: Array<{ key: string; value: any }> = [];
  const defaultOptions: AdapterOptions = {
    preserveNullish: false,
    preserveArrays: true,
    defaultValue: '',
    ...options,
  };

  function process(value: any, keyPrefix = ''): void {
    if (value === null || value === undefined) {
      if (defaultOptions.preserveNullish) {
        result.push({ key: keyPrefix, value });
      } else if (keyPrefix) {
        result.push({ key: keyPrefix, value: defaultOptions.defaultValue });
      }
      return;
    }

    if (typeof value !== 'object' || value === null) {
      if (keyPrefix) {
        result.push({ key: keyPrefix, value });
      }
      return;
    }

    if (Array.isArray(value)) {
      if (defaultOptions.preserveArrays) {
        value.forEach((item, index) => {
          const newKey = `${keyPrefix}[${index}]`;
          if (typeof item === 'object' && item !== null) {
            process(item, newKey);
          } else {
            result.push({ key: newKey, value: item });
          }
        });
      } else {
        result.push({ key: keyPrefix, value: value.join(',') });
      }
      return;
    }

    Object.entries(value).forEach(([key, propValue]) => {
      const newKey = keyPrefix ? `${keyPrefix}[${key}]` : key;

      // Handle custom transformers if provided
      if (defaultOptions.transformers && newKey in defaultOptions.transformers) {
        result.push({ key: newKey, value: defaultOptions.transformers[newKey](propValue) });
        return;
      }

      if (propValue === null || propValue === undefined) {
        if (defaultOptions.preserveNullish) {
          result.push({ key: newKey, value: propValue });
        } else {
          result.push({ key: newKey, value: defaultOptions.defaultValue });
        }
        return;
      }

      if (typeof propValue === 'object' && propValue !== null) {
        process(propValue, newKey);
      } else {
        result.push({ key: newKey, value: propValue });
      }
    });
  }

  process(obj);
  return result;
}

/**
 * Convert key-value pairs back to a nested object structure
 * 
 * @example
 * ```
 * // Input
 * [
 *   { key: 'user[name]', value: 'John' },
 *   { key: 'user[age]', value: 30 },
 *   { key: 'active', value: true }
 * ]
 * 
 * // Output
 * {
 *   user: {
 *     name: 'John',
 *     age: 30
 *   },
 *   active: true
 * }
 * ```
 */
export function keyValuePairsToObject(
  pairs: Array<{ key: string; value: any }>,
  options: AdapterOptions = {}
): Record<string, any> {
  const result: Record<string, any> = {};
  
  pairs.forEach(({ key, value }) => {
    // Check for array notation: key[index] or key[property]
    const matches = key.match(/^([^\[]+)(\[.*\])$/);
    
    if (matches) {
      const mainKey = matches[1];
      const rest = matches[2];
      
      // Initialize the object if it doesn't exist
      if (!result[mainKey]) {
        result[mainKey] = {};
      }
      
      // Parse the brackets
      const propMatches = rest.match(/\[([^\]]*)\]/g);
      if (propMatches) {
        let current = result[mainKey];
        
        propMatches.forEach((match, index) => {
          const prop = match.slice(1, -1); // Remove the brackets
          
          // If this is the last property, set the value
          if (index === propMatches.length - 1) {
            current[prop] = value;
          } else {
            // Otherwise, create the next level if needed
            if (!current[prop]) {
              // Check if the next level is an array or object
              const nextMatch = propMatches[index + 1];
              const nextProp = nextMatch.slice(1, -1);
              
              // If the next property is a number, create an array
              current[prop] = /^\\d+$/.test(nextProp) ? [] : {};
            }
            current = current[prop];
          }
        });
      }
    } else {
      // Simple key
      result[key] = value;
    }
  });
  
  return result;
}