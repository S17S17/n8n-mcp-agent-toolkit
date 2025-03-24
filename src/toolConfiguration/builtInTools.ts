/**
 * Predefined tools for n8n workflows
 */

import { Tool } from './toolSchema';
import { globalToolRegistry } from './toolRegistry';

/**
 * HTTP Request tool for making external API calls
 */
export const httpRequestTool: Tool = {
  name: 'httpRequest',
  description: 'Make an HTTP request to an external API',
  parameters: {
    url: {
      name: 'url',
      description: 'The URL to send the request to',
      type: 'string',
      required: true,
    },
    method: {
      name: 'method',
      description: 'The HTTP method to use',
      type: 'string',
      required: true,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    },
    headers: {
      name: 'headers',
      description: 'HTTP headers to include in the request',
      type: 'object',
      required: false,
      properties: {},
      additionalProperties: true,
    },
    queryParameters: {
      name: 'queryParameters',
      description: 'Query parameters to include in the URL',
      type: 'object',
      required: false,
      properties: {},
      additionalProperties: true,
    },
    body: {
      name: 'body',
      description: 'The body of the request (for POST, PUT, PATCH)',
      type: 'string',
      required: false,
    },
  },
  requiredParameters: ['url', 'method'],
  returns: {
    name: 'response',
    description: 'The HTTP response',
    type: 'object',
    properties: {
      statusCode: {
        name: 'statusCode',
        description: 'The HTTP status code',
        type: 'number',
        required: true,
      },
      headers: {
        name: 'headers',
        description: 'The response headers',
        type: 'object',
        required: true,
        properties: {},
        additionalProperties: true,
      },
      body: {
        name: 'body',
        description: 'The response body',
        type: 'string',
        required: true,
      },
    },
    required: true,
  },
  tags: ['http', 'api', 'external'],
  examples: [
    {
      input: {
        url: 'https://api.example.com/data',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer abc123',
        },
      },
      output: {
        statusCode: 200,
        headers: {
          'content-type': 'application/json',
        },
        body: '{"data": {"id": 1, "name": "Example"}}',
      },
      description: 'Get data from an example API',
    },
  ],
};

/**
 * Database Query tool for retrieving data from databases
 */
export const databaseQueryTool: Tool = {
  name: 'databaseQuery',
  description: 'Query a database to retrieve or manipulate data',
  parameters: {
    connectionName: {
      name: 'connectionName',
      description: 'The name of the database connection to use',
      type: 'string',
      required: true,
    },
    query: {
      name: 'query',
      description: 'The SQL query to execute',
      type: 'string',
      required: true,
    },
    parameters: {
      name: 'parameters',
      description: 'Parameters for the query (to prevent SQL injection)',
      type: 'array',
      required: false,
      items: {
        name: 'parameter',
        description: 'A parameter value',
        type: 'string',
        required: true,
      },
    },
  },
  requiredParameters: ['connectionName', 'query'],
  returns: {
    name: 'result',
    description: 'The query result',
    type: 'object',
    properties: {
      rows: {
        name: 'rows',
        description: 'The rows returned by the query',
        type: 'array',
        required: true,
        items: {
          name: 'row',
          description: 'A result row',
          type: 'object',
          required: true,
          properties: {},
          additionalProperties: true,
        },
      },
      rowCount: {
        name: 'rowCount',
        description: 'The number of rows affected or returned',
        type: 'number',
        required: true,
      },
    },
    required: true,
  },
  tags: ['database', 'sql', 'data'],
  examples: [
    {
      input: {
        connectionName: 'postgres',
        query: 'SELECT * FROM users WHERE id = $1',
        parameters: ['123'],
      },
      output: {
        rows: [
          { id: 123, name: 'John Doe', email: 'john@example.com' },
        ],
        rowCount: 1,
      },
      description: 'Query a user from a PostgreSQL database',
    },
  ],
};

/**
 * File operation tool for reading, writing, and listing files
 */
export const fileOperationTool: Tool = {
  name: 'fileOperation',
  description: 'Perform operations on files and directories',
  parameters: {
    operation: {
      name: 'operation',
      description: 'The operation to perform',
      type: 'string',
      required: true,
      enum: ['read', 'write', 'list', 'delete', 'exists'],
    },
    path: {
      name: 'path',
      description: 'The path to the file or directory',
      type: 'string',
      required: true,
    },
    content: {
      name: 'content',
      description: 'The content to write (for write operation)',
      type: 'string',
      required: false,
    },
    encoding: {
      name: 'encoding',
      description: 'The encoding to use for reading or writing',
      type: 'string',
      required: false,
      default: 'utf8',
    },
  },
  requiredParameters: ['operation', 'path'],
  returns: {
    name: 'result',
    description: 'The result of the file operation',
    type: 'object',
    properties: {
      success: {
        name: 'success',
        description: 'Whether the operation was successful',
        type: 'boolean',
        required: true,
      },
      data: {
        name: 'data',
        description: 'The operation result data',
        type: 'string',
        required: false,
      },
      files: {
        name: 'files',
        description: 'List of files (for list operation)',
        type: 'array',
        required: false,
        items: {
          name: 'file',
          description: 'A file or directory',
          type: 'object',
          required: true,
          properties: {
            name: {
              name: 'name',
              description: 'The file or directory name',
              type: 'string',
              required: true,
            },
            path: {
              name: 'path',
              description: 'The full path',
              type: 'string',
              required: true,
            },
            type: {
              name: 'type',
              description: 'The item type (file or directory)',
              type: 'string',
              required: true,
              enum: ['file', 'directory'],
            },
            size: {
              name: 'size',
              description: 'The file size in bytes',
              type: 'number',
              required: false,
            },
          },
        },
      },
      error: {
        name: 'error',
        description: 'Error message if the operation failed',
        type: 'string',
        required: false,
      },
    },
    required: true,
  },
  tags: ['file', 'filesystem', 'io'],
};

/**
 * Weather data tool for retrieving weather information
 */
export const weatherTool: Tool = {
  name: 'weatherInfo',
  description: 'Get weather information for a location',
  parameters: {
    location: {
      name: 'location',
      description: 'The location to get weather for (city name, zip code, or coordinates)',
      type: 'string',
      required: true,
    },
    units: {
      name: 'units',
      description: 'The units to use for temperature and other measurements',
      type: 'string',
      required: false,
      enum: ['metric', 'imperial'],
      default: 'metric',
    },
  },
  requiredParameters: ['location'],
  returns: {
    name: 'weather',
    description: 'Weather information',
    type: 'object',
    properties: {
      temperature: {
        name: 'temperature',
        description: 'Current temperature',
        type: 'number',
        required: true,
      },
      feelsLike: {
        name: 'feelsLike',
        description: 'What the temperature feels like',
        type: 'number',
        required: true,
      },
      conditions: {
        name: 'conditions',
        description: 'Weather conditions description',
        type: 'string',
        required: true,
      },
      humidity: {
        name: 'humidity',
        description: 'Humidity percentage',
        type: 'number',
        required: true,
      },
      windSpeed: {
        name: 'windSpeed',
        description: 'Wind speed',
        type: 'number',
        required: true,
      },
      forecast: {
        name: 'forecast',
        description: 'Forecast for upcoming days',
        type: 'array',
        required: false,
        items: {
          name: 'day',
          description: 'Forecast for a single day',
          type: 'object',
          required: true,
          properties: {
            date: {
              name: 'date',
              description: 'The date of the forecast',
              type: 'string',
              required: true,
            },
            high: {
              name: 'high',
              description: 'High temperature',
              type: 'number',
              required: true,
            },
            low: {
              name: 'low',
              description: 'Low temperature',
              type: 'number',
              required: true,
            },
            conditions: {
              name: 'conditions',
              description: 'Weather conditions description',
              type: 'string',
              required: true,
            },
          },
        },
      },
    },
    required: true,
  },
  tags: ['weather', 'external', 'api'],
};

/**
 * All built-in tools
 */
export const builtInTools: Tool[] = [
  httpRequestTool,
  databaseQueryTool,
  fileOperationTool,
  weatherTool,
];

/**
 * Register all built-in tools in the global registry
 */
export function registerBuiltInTools(): void {
  builtInTools.forEach(tool => {
    if (!globalToolRegistry.hasTool(tool.name)) {
      globalToolRegistry.registerTool(tool);
    }
  });
}

/**
 * Get a built-in tool by name
 */
export function getBuiltInTool(name: string): Tool | undefined {
  return builtInTools.find(tool => tool.name === name);
}