/**
 * Schema definitions for AI tools in n8n MCP
 */

import { z } from 'zod';

/**
 * Base schema for all tool parameters
 */
export const toolParameterSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
  required: z.boolean().default(false),
});

/**
 * Schema for string parameters
 */
export const stringParameterSchema = toolParameterSchema.extend({
  type: z.literal('string'),
  format: z.enum(['date', 'date-time', 'email', 'uri', 'regex', 'text']).optional(),
  minLength: z.number().int().optional(),
  maxLength: z.number().int().optional(),
  pattern: z.string().optional(),
  enum: z.array(z.string()).optional(),
  default: z.string().optional(),
});

/**
 * Schema for number parameters
 */
export const numberParameterSchema = toolParameterSchema.extend({
  type: z.literal('number'),
  minimum: z.number().optional(),
  maximum: z.number().optional(),
  multipleOf: z.number().optional(),
  format: z.enum(['float', 'double', 'int32', 'int64']).optional(),
  default: z.number().optional(),
});

/**
 * Schema for boolean parameters
 */
export const booleanParameterSchema = toolParameterSchema.extend({
  type: z.literal('boolean'),
  default: z.boolean().optional(),
});

/**
 * Schema for array parameters
 */
export const arrayParameterSchema = toolParameterSchema.extend({
  type: z.literal('array'),
  items: z.lazy(() => toolParameterSchema.or(
    stringParameterSchema.or(
      numberParameterSchema.or(
        booleanParameterSchema.or(
          arrayParameterSchema.or(
            objectParameterSchema
          )
        )
      )
    )
  )),
  minItems: z.number().int().optional(),
  maxItems: z.number().int().optional(),
  uniqueItems: z.boolean().optional(),
  default: z.array(z.any()).optional(),
});

/**
 * Schema for object parameters
 */
export const objectParameterSchema = toolParameterSchema.extend({
  type: z.literal('object'),
  properties: z.record(
    z.string(),
    z.lazy(() => toolParameterSchema.or(
      stringParameterSchema.or(
        numberParameterSchema.or(
          booleanParameterSchema.or(
            arrayParameterSchema.or(
              objectParameterSchema
            )
          )
        )
      )
    ))
  ).optional(),
  required: z.array(z.string()).optional(),
  additionalProperties: z.boolean().optional(),
  default: z.record(z.string(), z.any()).optional(),
});

/**
 * Union type for all parameter schemas
 */
export const parameterSchema = z.union([
  stringParameterSchema,
  numberParameterSchema,
  booleanParameterSchema,
  arrayParameterSchema,
  objectParameterSchema,
]);

/**
 * Schema for tool definitions
 */
export const toolSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  parameters: z.record(z.string(), parameterSchema).optional(),
  requiredParameters: z.array(z.string()).optional(),
  returns: parameterSchema.optional(),
  tags: z.array(z.string()).optional(),
  examples: z.array(z.object({
    input: z.record(z.string(), z.any()),
    output: z.any(),
    description: z.string().optional(),
  })).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * Type definitions from schemas
 */
export type ToolParameter = z.infer<typeof toolParameterSchema>;
export type StringParameter = z.infer<typeof stringParameterSchema>;
export type NumberParameter = z.infer<typeof numberParameterSchema>;
export type BooleanParameter = z.infer<typeof booleanParameterSchema>;
export type ArrayParameter = z.infer<typeof arrayParameterSchema>;
export type ObjectParameter = z.infer<typeof objectParameterSchema>;
export type Parameter = z.infer<typeof parameterSchema>;
export type Tool = z.infer<typeof toolSchema>;

/**
 * Validates a parameter against the parameter schema
 */
export function validateParameter(parameter: unknown): Parameter {
  return parameterSchema.parse(parameter);
}

/**
 * Validates a tool definition against the tool schema
 */
export function validateTool(tool: unknown): Tool {
  return toolSchema.parse(tool);
}

/**
 * Convert a tool definition to a JSON schema format
 * that's compatible with LangChain, Assistants API, etc.
 */
export function toolToJsonSchema(tool: Tool): any {
  const parameterToJsonSchema = (param: Parameter, isRequired: boolean): any => {
    const base = {
      type: param.type,
      description: param.description,
    };

    if (param.type === 'string') {
      return {
        ...base,
        ...(param.format && { format: param.format }),
        ...(param.minLength !== undefined && { minLength: param.minLength }),
        ...(param.maxLength !== undefined && { maxLength: param.maxLength }),
        ...(param.pattern && { pattern: param.pattern }),
        ...(param.enum && { enum: param.enum }),
        ...(param.default !== undefined && { default: param.default }),
      };
    }

    if (param.type === 'number') {
      return {
        ...base,
        ...(param.minimum !== undefined && { minimum: param.minimum }),
        ...(param.maximum !== undefined && { maximum: param.maximum }),
        ...(param.multipleOf !== undefined && { multipleOf: param.multipleOf }),
        ...(param.format && { format: param.format }),
        ...(param.default !== undefined && { default: param.default }),
      };
    }

    if (param.type === 'boolean') {
      return {
        ...base,
        ...(param.default !== undefined && { default: param.default }),
      };
    }

    if (param.type === 'array') {
      const arrayParam = param as ArrayParameter;
      return {
        ...base,
        items: parameterToJsonSchema(arrayParam.items, false),
        ...(arrayParam.minItems !== undefined && { minItems: arrayParam.minItems }),
        ...(arrayParam.maxItems !== undefined && { maxItems: arrayParam.maxItems }),
        ...(arrayParam.uniqueItems !== undefined && { uniqueItems: arrayParam.uniqueItems }),
        ...(arrayParam.default !== undefined && { default: arrayParam.default }),
      };
    }

    if (param.type === 'object') {
      const objectParam = param as ObjectParameter;
      const properties: Record<string, any> = {};

      if (objectParam.properties) {
        Object.entries(objectParam.properties).forEach(([propName, propSchema]) => {
          const isRequiredProp = objectParam.required?.includes(propName) || false;
          properties[propName] = parameterToJsonSchema(propSchema as Parameter, isRequiredProp);
        });
      }

      return {
        ...base,
        properties,
        ...(objectParam.required && { required: objectParam.required }),
        ...(objectParam.additionalProperties !== undefined && { 
          additionalProperties: objectParam.additionalProperties 
        }),
        ...(objectParam.default !== undefined && { default: objectParam.default }),
      };
    }

    return base;
  };

  // Handle required parameters
  const required = tool.requiredParameters ?? [];

  // Create properties from parameters
  const properties: Record<string, any> = {};
  if (tool.parameters) {
    Object.entries(tool.parameters).forEach(([name, param]) => {
      const isRequired = required.includes(name);
      properties[name] = parameterToJsonSchema(param, isRequired);
    });
  }

  // Build the final schema
  return {
    name: tool.name,
    description: tool.description,
    parameters: {
      type: 'object',
      properties,
      required,
    },
    ...(tool.returns && { returns: parameterToJsonSchema(tool.returns, true) }),
  };
}