/**
 * Utility functions and templates for chat-based prompts
 */

import { CompletePromptTemplate } from './schemas';

/**
 * Template for a basic chatbot
 */
export const BASIC_CHATBOT_TEMPLATE: CompletePromptTemplate = {
  id: 'basic-chatbot',
  name: 'Basic Chatbot',
  description: 'A simple chatbot template with history',
  templateType: 'complete',
  template: 'Basic chatbot template',
  prompts: [
    {
      role: 'system',
      content: `You are a helpful AI assistant integrated with n8n workflow automation.
      
Your goal is to assist the user with their requests in a helpful, accurate, and concise manner.

Current date: {{currentDate}}
{{#if workflowName}}Workflow name: {{workflowName}}{{/if}}`,
    },
    {
      role: 'user',
      content: '{{input}}',
    },
  ],
  variables: ['currentDate', 'workflowName', 'input'],
  tags: ['chat', 'basic'],
};

/**
 * Template for a chatbot with conversation history
 */
export const CHATBOT_WITH_HISTORY_TEMPLATE: CompletePromptTemplate = {
  id: 'chatbot-with-history',
  name: 'Chatbot With History',
  description: 'A chatbot template that includes conversation history',
  templateType: 'complete',
  template: 'Chatbot with history template',
  prompts: [
    {
      role: 'system',
      content: `You are a helpful AI assistant integrated with n8n workflow automation.
      
Your goal is to assist the user with their requests in a helpful, accurate, and concise manner.

Current date: {{currentDate}}
{{#if workflowName}}Workflow name: {{workflowName}}{{/if}}`,
    },
    {
      role: 'user',
      content: '{{#each history}}{{#if this.user}}User: {{this.user}}{{/if}}{{#if this.assistant}}\\n\\nAssistant: {{this.assistant}}{{/if}}\\n\\n{{/each}}User: {{input}}',
    },
  ],
  variables: ['currentDate', 'workflowName', 'history', 'input'],
  tags: ['chat', 'history'],
};

/**
 * Template for an agent that can use tools
 */
export const AGENT_WITH_TOOLS_TEMPLATE: CompletePromptTemplate = {
  id: 'agent-with-tools',
  name: 'Agent With Tools',
  description: 'An agent that can use tools to complete tasks',
  templateType: 'complete',
  template: 'Agent with tools template',
  prompts: [
    {
      role: 'system',
      content: `You are an AI assistant with access to tools that can help you complete tasks.

To use a tool, respond with a message that includes a tool call.

Available tools:
{{#each tools}}
- {{this.name}}: {{this.description}}
{{/each}}

Current date: {{currentDate}}
{{#if workflowName}}Workflow name: {{workflowName}}{{/if}}

IMPORTANT: Always choose the most appropriate tool for the task. Think step-by-step about what information you need and which tool can provide it.`,
    },
    {
      role: 'user',
      content: '{{#each history}}{{#if this.user}}User: {{this.user}}{{/if}}{{#if this.assistant}}\\n\\nAssistant: {{this.assistant}}{{/if}}{{#if this.toolCalls}}\\n\\nTool Calls: {{this.toolCalls}}{{/if}}{{#if this.toolResults}}\\n\\nTool Results: {{this.toolResults}}{{/if}}\\n\\n{{/each}}User: {{input}}',
    },
  ],
  variables: ['tools', 'currentDate', 'workflowName', 'history', 'input'],
  tags: ['agent', 'tools'],
};

/**
 * Template for a specialized service chatbot (customer support, etc.)
 */
export const SERVICE_CHATBOT_TEMPLATE: CompletePromptTemplate = {
  id: 'service-chatbot',
  name: 'Service Chatbot',
  description: 'A chatbot for customer service, support, or other specialized services',
  templateType: 'complete',
  template: 'Service chatbot template',
  prompts: [
    {
      role: 'system',
      content: `You are a {{serviceName}} assistant helping users with their questions and needs.

Your responsibilities:
{{#each responsibilities}}
- {{this}}
{{/each}}

Key information:
{{#each keyInformation}}
- {{this}}
{{/each}}

Current date: {{currentDate}}
{{#if workflowName}}Workflow name: {{workflowName}}{{/if}}

Tone and style: {{tone}}

IMPORTANT: If you don't know the answer to a question, don't make up information. Instead, offer to help the user contact a human representative.`,
    },
    {
      role: 'user',
      content: '{{#each history}}{{#if this.user}}User: {{this.user}}{{/if}}{{#if this.assistant}}\\n\\nAssistant: {{this.assistant}}{{/if}}\\n\\n{{/each}}User: {{input}}',
    },
  ],
  variables: ['serviceName', 'responsibilities', 'keyInformation', 'tone', 'currentDate', 'workflowName', 'history', 'input'],
  tags: ['chat', 'service', 'specialized'],
};

/**
 * Template for a chatbot that can process structured data
 */
export const DATA_PROCESSING_CHATBOT_TEMPLATE: CompletePromptTemplate = {
  id: 'data-processing-chatbot',
  name: 'Data Processing Chatbot',
  description: 'A chatbot that can process and analyze structured data',
  templateType: 'complete',
  template: 'Data processing chatbot template',
  prompts: [
    {
      role: 'system',
      content: `You are an AI assistant that helps analyze and process data.

You have access to the following data:
{{#if dataDescription}}{{dataDescription}}{{else}}(No data provided){{/if}}

Current date: {{currentDate}}
{{#if workflowName}}Workflow name: {{workflowName}}{{/if}}

Your task is to help the user understand, analyze, and extract insights from this data.
When responding, always reference specific data points to support your conclusions.`,
    },
    {
      role: 'user',
      content: '{{#each history}}{{#if this.user}}User: {{this.user}}{{/if}}{{#if this.assistant}}\\n\\nAssistant: {{this.assistant}}{{/if}}\\n\\n{{/each}}User: {{input}}',
    },
  ],
  variables: ['dataDescription', 'currentDate', 'workflowName', 'history', 'input'],
  tags: ['chat', 'data', 'analysis'],
};

/**
 * Collection of all chat prompt templates
 */
export const CHAT_PROMPTS: Record<string, CompletePromptTemplate> = {
  BASIC_CHATBOT_TEMPLATE,
  CHATBOT_WITH_HISTORY_TEMPLATE,
  AGENT_WITH_TOOLS_TEMPLATE,
  SERVICE_CHATBOT_TEMPLATE,
  DATA_PROCESSING_CHATBOT_TEMPLATE,
};

/**
 * Get a chat prompt template by ID
 */
export function getChatPromptById(id: string): CompletePromptTemplate | undefined {
  return Object.values(CHAT_PROMPTS).find(prompt => prompt.id === id);
}