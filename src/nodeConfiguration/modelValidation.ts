/**
 * Utilities for validating AI model configurations
 */
import { z } from 'zod';

/**
 * Base schema for model parameters
 */
export const baseModelParamsSchema = z.object({
  temperature: z.number().min(0).max(2).optional(),
  topP: z.number().min(0).max(1).optional(),
  maxTokens: z.number().positive().optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  timeout: z.number().positive().optional(),
});

/**
 * Schema for chat model parameters
 */
export const chatModelParamsSchema = baseModelParamsSchema.extend({
  model: z.string().min(1),
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant', 'function', 'tool']),
      content: z.string().or(z.array(z.any())),
      name: z.string().optional(),
    })
  ),
  functions: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        parameters: z.record(z.any()).optional(),
      })
    )
    .optional(),
  tools: z
    .array(
      z.object({
        type: z.string(),
        function: z
          .object({
            name: z.string(),
            description: z.string().optional(),
            parameters: z.record(z.any()).optional(),
          })
          .optional(),
      })
    )
    .optional(),
  responseFormat: z
    .object({
      type: z.enum(['text', 'json_object']),
    })
    .optional(),
});

/**
 * Schema for completion model parameters
 */
export const completionModelParamsSchema = baseModelParamsSchema.extend({
  model: z.string().min(1),
  prompt: z.string().min(1),
});

/**
 * Schema for embedding model parameters
 */
export const embeddingModelParamsSchema = z.object({
  model: z.string().min(1),
  input: z.string().or(z.array(z.string())),
  dimensions: z.number().positive().optional(),
});

/**
 * Validates chat model parameters
 * 
 * @param params The parameters to validate
 * @returns The validated parameters or throws an error
 */
export function validateChatModelParams(params: unknown) {
  return chatModelParamsSchema.parse(params);
}

/**
 * Validates completion model parameters
 * 
 * @param params The parameters to validate
 * @returns The validated parameters or throws an error
 */
export function validateCompletionModelParams(params: unknown) {
  return completionModelParamsSchema.parse(params);
}

/**
 * Validates embedding model parameters
 * 
 * @param params The parameters to validate
 * @returns The validated parameters or throws an error
 */
export function validateEmbeddingModelParams(params: unknown) {
  return embeddingModelParamsSchema.parse(params);
}

/**
 * Type definitions for model parameters
 */
export type ChatModelParams = z.infer<typeof chatModelParamsSchema>;
export type CompletionModelParams = z.infer<typeof completionModelParamsSchema>;
export type EmbeddingModelParams = z.infer<typeof embeddingModelParamsSchema>;