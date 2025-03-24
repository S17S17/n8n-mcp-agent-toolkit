/**
 * Schema definitions for prompt templates
 */

import { z } from 'zod';

/**
 * Base prompt template schema with common properties
 */
export const basePromptTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  version: z.string().optional().default('1.0.0'),
  templateType: z.enum(['system', 'user', 'assistant', 'function', 'tool', 'complete']),
  template: z.string().min(1),
  variables: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  metadata: z.record(z.string(), z.any()).optional().default({}),
});

/**
 * Schema for system prompt templates
 */
export const systemPromptTemplateSchema = basePromptTemplateSchema.extend({
  templateType: z.literal('system'),
});

/**
 * Schema for user prompt templates
 */
export const userPromptTemplateSchema = basePromptTemplateSchema.extend({
  templateType: z.literal('user'),
});

/**
 * Schema for assistant prompt templates
 */
export const assistantPromptTemplateSchema = basePromptTemplateSchema.extend({
  templateType: z.literal('assistant'),
});

/**
 * Schema for function/tool prompt templates
 */
export const functionPromptTemplateSchema = basePromptTemplateSchema.extend({
  templateType: z.enum(['function', 'tool']),
  functionName: z.string().min(1),
  parameters: z.record(z.string(), z.any()).optional(),
});

/**
 * Schema for complete prompt templates (combination of multiple prompts)
 */
export const completePromptTemplateSchema = basePromptTemplateSchema.extend({
  templateType: z.literal('complete'),
  prompts: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant', 'function', 'tool']),
    content: z.string().min(1),
    name: z.string().optional(),
  })),
});

/**
 * Union type for all prompt template schemas
 */
export const promptTemplateSchema = z.discriminatedUnion('templateType', [
  systemPromptTemplateSchema,
  userPromptTemplateSchema,
  assistantPromptTemplateSchema,
  functionPromptTemplateSchema,
  completePromptTemplateSchema,
]);

/**
 * Type definitions for prompt templates
 */
export type BasePromptTemplate = z.infer<typeof basePromptTemplateSchema>;
export type SystemPromptTemplate = z.infer<typeof systemPromptTemplateSchema>;
export type UserPromptTemplate = z.infer<typeof userPromptTemplateSchema>;
export type AssistantPromptTemplate = z.infer<typeof assistantPromptTemplateSchema>;
export type FunctionPromptTemplate = z.infer<typeof functionPromptTemplateSchema>;
export type CompletePromptTemplate = z.infer<typeof completePromptTemplateSchema>;
export type PromptTemplate = z.infer<typeof promptTemplateSchema>;

/**
 * Schema for a prompt template collection (e.g., for a specific use case)
 */
export const promptTemplateCollectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  version: z.string().optional().default('1.0.0'),
  templates: z.array(promptTemplateSchema),
  metadata: z.record(z.string(), z.any()).optional().default({}),
});

export type PromptTemplateCollection = z.infer<typeof promptTemplateCollectionSchema>;

/**
 * Validates a prompt template against its schema
 */
export function validatePromptTemplate(template: unknown): PromptTemplate {
  return promptTemplateSchema.parse(template);
}

/**
 * Validates a prompt template collection against its schema
 */
export function validatePromptTemplateCollection(
  collection: unknown
): PromptTemplateCollection {
  return promptTemplateCollectionSchema.parse(collection);
}