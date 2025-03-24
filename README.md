# n8n-mcp-agent-toolkit

A toolkit for enhancing AI agent workflow support in n8n with the Model Context Protocol (MCP).

## Overview

This toolkit provides utilities, components, and patterns to make it easier to build and configure AI agents within n8n workflows using the Model Context Protocol (MCP). It addresses several key areas:

1. **AI Node Configuration**: Standardized templates, validation, and error handling for AI nodes
2. **Prompt Engineering**: Reusable templates and schema definitions for prompt management
3. **Tool Configuration**: Unified interfaces for defining and managing tools for AI agents
4. **Data Handling**: Utilities for converting, validating, and formatting data between AI and non-AI nodes

## Installation

```bash
npm install n8n-mcp-agent-toolkit
```

## Usage

### AI Node Configuration

Define node types and capabilities:

```typescript
import { AiNodeCapability, isLanguageModelCapable } from 'n8n-mcp-agent-toolkit';

// Define node capabilities
const capabilities = [AiNodeCapability.LANGUAGE_MODEL, AiNodeCapability.CHAT_MODEL];

// Check if node has language model capability
if (isLanguageModelCapable(capabilities)) {
  // Configure language model options
}
```

### Prompt Templates

Create and format prompt templates:

```typescript
import { 
  WORKFLOW_AUTOMATION_EXPERT_PROMPT, 
  formatPromptTemplate 
} from 'n8n-mcp-agent-toolkit';

// Format a system prompt with variables
const formattedPrompt = formatPromptTemplate(
  WORKFLOW_AUTOMATION_EXPERT_PROMPT,
  {
    currentDate: new Date().toISOString(),
    workflowName: 'Data Processing Pipeline'
  }
);
```

### Tool Configuration

Register and use tools:

```typescript
import { 
  registerTool, 
  toolToJsonSchema,
  httpRequestTool
} from 'n8n-mcp-agent-toolkit';

// Register a built-in tool
registerTool(httpRequestTool);

// Convert to JSON Schema for LangChain or other frameworks
const schema = toolToJsonSchema(httpRequestTool);
```

### Data Handling

Handle data conversion and validation:

```typescript
import { 
  jsonToFlatRecord,
  validateWithZod,
  formatValue
} from 'n8n-mcp-agent-toolkit';

// Convert nested JSON to flat key-value pairs
const flatData = jsonToFlatRecord(complexObject);

// Validate data against a schema
const validation = validateWithZod(data, mySchema);

// Format values for display
const formattedDate = formatValue(new Date(), { dateFormat: 'long', includeTime: true });
```

## Components

### AI Node Configuration

- **nodeTypes**: Define and check AI node capabilities
- **modelValidation**: Validate AI model parameters
- **errorHandling**: Standardized error handling for AI nodes
- **nodePropertyTemplates**: Reusable n8n node properties

### Prompt Templates

- **schemas**: Zod schemas for prompt templates
- **systemPrompts**: Pre-defined system prompts
- **formatters**: Format templates with variables
- **chatPrompts**: Chat-specific prompt templates

### Tool Configuration

- **toolSchema**: Schema definitions for AI tools
- **toolRegistry**: Registry for managing tools
- **builtInTools**: Pre-defined tools

### Data Handling

- **adapters**: Convert between data formats
- **validators**: Validate data
- **formatters**: Format data for display

## Contributing

Contributions are welcome! Please check out our [contributing guidelines](CONTRIBUTING.md).

## License

MIT