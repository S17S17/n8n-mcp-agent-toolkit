/**
 * Node types and interfaces for AI nodes in n8n-MCP
 */

/**
 * Defines the different types of AI node capabilities
 */
export enum AiNodeCapabilityType {
  LANGUAGE_MODEL = 'languageModel',
  EMBEDDING_MODEL = 'embeddingModel',
  CHAT_MODEL = 'chatModel',
  TOOL_PROVIDER = 'toolProvider',
  MEMORY = 'memory',
}

/**
 * Basic interface for all AI node capability definitions
 */
export interface IAiNodeCapability {
  type: AiNodeCapabilityType;
  description: string;
}

/**
 * Node capability for providing language model functionality
 */
export interface ILanguageModelCapability extends IAiNodeCapability {
  type: AiNodeCapabilityType.LANGUAGE_MODEL;
  supportsFunctions?: boolean;
  supportsStreaming?: boolean;
  maxTokens?: number;
}

/**
 * Node capability for providing embedding model functionality
 */
export interface IEmbeddingModelCapability extends IAiNodeCapability {
  type: AiNodeCapabilityType.EMBEDDING_MODEL;
  dimensions?: number;
}

/**
 * Node capability for providing chat model functionality
 */
export interface IChatModelCapability extends IAiNodeCapability {
  type: AiNodeCapabilityType.CHAT_MODEL;
  supportsFunctions?: boolean;
  supportsStreaming?: boolean;
  supportsVision?: boolean;
  maxTokens?: number;
}

/**
 * Node capability for providing tool functionality
 */
export interface IToolProviderCapability extends IAiNodeCapability {
  type: AiNodeCapabilityType.TOOL_PROVIDER;
  tools: ToolDefinition[];
}

/**
 * Node capability for providing memory functionality
 */
export interface IMemoryCapability extends IAiNodeCapability {
  type: AiNodeCapabilityType.MEMORY;
  supportsContext?: boolean;
  supportsRetrieval?: boolean;
}

/**
 * Definition for a tool provided by a node
 */
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameter[];
  returnType: string;
}

/**
 * Parameter for a tool
 */
export interface ToolParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: any;
}

/**
 * Type guard to check if a capability is a language model
 */
export function isLanguageModelCapability(
  capability: IAiNodeCapability
): capability is ILanguageModelCapability {
  return capability.type === AiNodeCapabilityType.LANGUAGE_MODEL;
}

/**
 * Type guard to check if a capability is an embedding model
 */
export function isEmbeddingModelCapability(
  capability: IAiNodeCapability
): capability is IEmbeddingModelCapability {
  return capability.type === AiNodeCapabilityType.EMBEDDING_MODEL;
}

/**
 * Type guard to check if a capability is a chat model
 */
export function isChatModelCapability(
  capability: IAiNodeCapability
): capability is IChatModelCapability {
  return capability.type === AiNodeCapabilityType.CHAT_MODEL;
}

/**
 * Type guard to check if a capability is a tool provider
 */
export function isToolProviderCapability(
  capability: IAiNodeCapability
): capability is IToolProviderCapability {
  return capability.type === AiNodeCapabilityType.TOOL_PROVIDER;
}

/**
 * Type guard to check if a capability is a memory provider
 */
export function isMemoryCapability(
  capability: IAiNodeCapability
): capability is IMemoryCapability {
  return capability.type === AiNodeCapabilityType.MEMORY;
}