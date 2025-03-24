/**
 * Common property templates for n8n nodes that work with AI models
 */

/**
 * Basic interface for n8n node properties
 */
export interface INodeProperty {
  displayName: string;
  name: string;
  type: string;
  default?: any;
  description?: string;
  placeholder?: string;
  required?: boolean;
  displayOptions?: {
    show?: Record<string, any>;
    hide?: Record<string, any>;
  };
  options?: Array<{
    name: string;
    value: string | number | boolean;
    description?: string;
  }>;
  typeOptions?: Record<string, any>;
}

/**
 * Common model selection properties for LLM nodes
 */
export const modelSelectionProperties: INodeProperty[] = [
  {
    displayName: 'Model',
    name: 'model',
    type: 'string',
    default: '',
    description: 'The ID of the model to use',
    required: true,
    typeOptions: {
      loadOptionsMethod: 'listModels',
    },
  },
  {
    displayName: 'Custom Model',
    name: 'customModel',
    type: 'string',
    displayOptions: {
      show: {
        model: ['custom'],
      },
    },
    default: '',
    description: 'Enter a custom model name not listed in the dropdown',
    placeholder: 'E.g., gpt-4-32k, claude-3-sonnet-20240229',
  },
];

/**
 * Common generation parameters for text generation models
 */
export const generationParameterProperties: INodeProperty[] = [
  {
    displayName: 'Options',
    name: 'options',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    options: [
      {
        displayName: 'Temperature',
        name: 'temperature',
        type: 'number',
        typeOptions: {
          minValue: 0,
          maxValue: 2,
          numberPrecision: 1,
        },
        default: 0.7,
        description: 'Controls randomness: Higher values produce more creative results but may be less predictable',
      },
      {
        displayName: 'Top P',
        name: 'topP',
        type: 'number',
        typeOptions: {
          minValue: 0,
          maxValue: 1,
          numberPrecision: 2,
        },
        default: 1,
        description: 'Controls diversity of responses via nucleus sampling (alternative to temperature)',
      },
      {
        displayName: 'Max Tokens',
        name: 'maxTokens',
        type: 'number',
        default: 1024,
        description: 'Maximum number of tokens to generate in the response',
      },
      {
        displayName: 'Frequency Penalty',
        name: 'frequencyPenalty',
        type: 'number',
        typeOptions: {
          minValue: -2,
          maxValue: 2,
          numberPrecision: 1,
        },
        default: 0,
        description: 'Reduces repetition of token sequences (higher values = less repetition)',
      },
      {
        displayName: 'Presence Penalty',
        name: 'presencePenalty',
        type: 'number',
        typeOptions: {
          minValue: -2,
          maxValue: 2,
          numberPrecision: 1,
        },
        default: 0,
        description: 'Reduces likelihood of reusing the same topics (higher values = more topic diversity)',
      },
      {
        displayName: 'Timeout (ms)',
        name: 'timeout',
        type: 'number',
        default: 60000,
        description: 'Maximum time in milliseconds to wait for the model response',
      },
      {
        displayName: 'Stream Response',
        name: 'stream',
        type: 'boolean',
        default: false,
        description: 'Whether to stream partial responses as they are generated',
      },
    ],
  },
];

/**
 * Common embedding model parameters
 */
export const embeddingParameterProperties: INodeProperty[] = [
  {
    displayName: 'Options',
    name: 'options',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    options: [
      {
        displayName: 'Batch Size',
        name: 'batchSize',
        type: 'number',
        default: 512,
        description: 'Number of texts to embed in each API call',
      },
      {
        displayName: 'Dimensions',
        name: 'dimensions',
        type: 'number',
        default: 1536,
        description: 'The dimensionality of the embeddings to generate',
      },
      {
        displayName: 'Timeout (ms)',
        name: 'timeout',
        type: 'number',
        default: 60000,
        description: 'Maximum time in milliseconds to wait for the model response',
      },
    ],
  },
];

/**
 * Common tool configuration properties for agent nodes
 */
export const toolConfigurationProperties: INodeProperty[] = [
  {
    displayName: 'Tools',
    name: 'tools',
    type: 'multiOptions',
    default: [],
    description: 'The tools the agent can use to answer user queries',
    typeOptions: {
      loadOptionsMethod: 'getToolOptions',
    },
  },
  {
    displayName: 'Tool Calling Strategy',
    name: 'toolCallingStrategy',
    type: 'options',
    default: 'auto',
    options: [
      {
        name: 'Auto',
        value: 'auto',
        description: 'Automatically choose when to call tools',
      },
      {
        name: 'Always',
        value: 'always',
        description: 'Always attempt to call at least one tool',
      },
      {
        name: 'Required',
        value: 'required',
        description: 'Require at least one tool call to be made',
      },
      {
        name: 'Never',
        value: 'never',
        description: 'Never use tools',
      },
    ],
  },
  {
    displayName: 'Maximum Tool Calls',
    name: 'maxToolCalls',
    type: 'number',
    default: 5,
    description: 'Maximum number of tool calls allowed in a single response',
  },
];

/**
 * Common memory configuration properties for chatbot nodes
 */
export const memoryConfigurationProperties: INodeProperty[] = [
  {
    displayName: 'Memory',
    name: 'memory',
    type: 'options',
    default: 'none',
    options: [
      {
        name: 'None',
        value: 'none',
        description: 'No conversation history is maintained',
      },
      {
        name: 'Buffer Memory',
        value: 'buffer',
        description: 'Simple message history with all previous messages',
      },
      {
        name: 'Window Memory',
        value: 'window',
        description: 'Rolling window of the last N messages',
      },
      {
        name: 'Summary Memory',
        value: 'summary',
        description: 'Summarizes old messages to maintain context while reducing token usage',
      },
      {
        name: 'Vector Store Memory',
        value: 'vectorStore',
        description: 'Uses semantic search to find relevant previous messages',
      },
    ],
  },
  {
    displayName: 'Memory Options',
    name: 'memoryOptions',
    type: 'collection',
    placeholder: 'Add Memory Option',
    default: {},
    displayOptions: {
      show: {
        memory: ['buffer', 'window', 'summary', 'vectorStore'],
      },
    },
    options: [
      {
        displayName: 'Window Size',
        name: 'windowSize',
        type: 'number',
        default: 5,
        description: 'Number of previous messages to keep in memory',
        displayOptions: {
          show: {
            '/memory': ['window'],
          },
        },
      },
      {
        displayName: 'Summary Template',
        name: 'summaryTemplate',
        type: 'string',
        default: 'Summarize the following conversation:\n{chat_history}',
        description: 'Template for summarizing conversation history',
        typeOptions: {
          rows: 4,
        },
        displayOptions: {
          show: {
            '/memory': ['summary'],
          },
        },
      },
      {
        displayName: 'Vector Store Connection',
        name: 'vectorStoreConnection',
        type: 'string',
        default: '',
        description: 'Connection to the vector store for conversation memory',
        displayOptions: {
          show: {
            '/memory': ['vectorStore'],
          },
        },
        typeOptions: {
          loadOptionsMethod: 'getVectorStoreConnections',
        },
      },
    ],
  },
];

/**
 * Common properties for handling streaming responses
 */
export const streamingResponseProperties: INodeProperty[] = [
  {
    displayName: 'Stream',
    name: 'stream',
    type: 'boolean',
    default: false,
    description: 'Whether to stream the response from the model',
  },
  {
    displayName: 'Streaming Options',
    name: 'streamingOptions',
    type: 'collection',
    placeholder: 'Add Streaming Option',
    default: {},
    displayOptions: {
      show: {
        stream: [true],
      },
    },
    options: [
      {
        displayName: 'Return Intermediate Steps',
        name: 'returnIntermediateSteps',
        type: 'boolean',
        default: false,
        description: 'Whether to return intermediate steps in the response (e.g., tool calls, thought process)',
      },
      {
        displayName: 'Include Raw Chunks',
        name: 'includeRawChunks',
        type: 'boolean',
        default: false,
        description: 'Include raw model response chunks in the output',
      },
    ],
  },
];