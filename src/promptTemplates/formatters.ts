/**
 * Utility functions for formatting prompts with variables
 */

import { PromptTemplate } from './schemas';

/**
 * Format a template string by replacing variables with values
 */
export function formatTemplate(
  templateString: string,
  variables: Record<string, any> = {}
): string {
  // Simple variable replacement
  let formatted = templateString;
  
  // Replace all {{variableName}} with the corresponding value
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    formatted = formatted.replace(regex, String(value || ''));
  });
  
  // Handle conditionals: {{#if variableName}}content{{/if}}
  const conditionalRegex = /{{#if\s+([^}]+)\s*}}([\s\S]*?){{\/if}}/g;
  formatted = formatted.replace(conditionalRegex, (match, conditionVar, content) => {
    return variables[conditionVar] ? content : '';
  });
  
  // Handle loops: {{#each variableName}}content with {{this}}{{/each}}
  const loopRegex = /{{#each\s+([^}]+)\s*}}([\s\S]*?){{\/each}}/g;
  formatted = formatted.replace(loopRegex, (match, arrayVar, content) => {
    const array = variables[arrayVar];
    if (!Array.isArray(array) || array.length === 0) return '';
    
    return array.map((item: any) => {
      // Replace {{this}} with the current item
      let renderedContent = content.replace(
        /{{this}}/g, 
        typeof item === 'object' ? JSON.stringify(item) : String(item)
      );
      
      // Handle accessing properties: {{this.property}}
      if (typeof item === 'object' && item !== null) {
        const propRegex = /{{this\.([^}]+)}}/g;
        renderedContent = renderedContent.replace(propRegex, (propMatch, propName) => {
          const propValue = item[propName];
          return propValue !== undefined ? String(propValue) : '';
        });
      }
      
      return renderedContent;
    }).join('');
  });
  
  // Remove any undefined variables that weren't replaced
  formatted = formatted.replace(/{{[^}]+}}/g, '');
  
  return formatted;
}

/**
 * Format a prompt template by replacing variables with values
 */
export function formatPromptTemplate(
  template: PromptTemplate,
  variables: Record<string, any> = {}
): PromptTemplate {
  // Create a deep copy to avoid mutating the original
  const formattedTemplate = { ...template };
  
  // Format the template string
  formattedTemplate.template = formatTemplate(template.template, variables);
  
  // If it's a complete prompt template, format each prompt in the array
  if (template.templateType === 'complete' && template.prompts) {
    formattedTemplate.prompts = template.prompts.map(prompt => ({
      ...prompt,
      content: formatTemplate(prompt.content, variables),
    }));
  }
  
  return formattedTemplate;
}

/**
 * Convert a prompt template to a format suitable for LangChain
 */
export function promptTemplateToLangChain(
  template: PromptTemplate,
  variables: Record<string, any> = {}
): { role: string; content: string; name?: string } {
  const formattedTemplate = formatPromptTemplate(template, variables);
  
  const role = formattedTemplate.templateType === 'function' || 
               formattedTemplate.templateType === 'tool'
    ? 'function'
    : formattedTemplate.templateType;
  
  const result: { role: string; content: string; name?: string } = {
    role,
    content: formattedTemplate.template,
  };
  
  // Add function name if it's a function template
  if (
    (formattedTemplate.templateType === 'function' || formattedTemplate.templateType === 'tool') && 
    'functionName' in formattedTemplate
  ) {
    result.name = formattedTemplate.functionName;
  }
  
  return result;
}

/**
 * Convert a set of prompt templates to a format suitable for LangChain
 */
export function promptTemplatesToLangChain(
  templates: PromptTemplate[],
  variables: Record<string, any> = {}
): Array<{ role: string; content: string; name?: string }> {
  return templates.map(template => promptTemplateToLangChain(template, variables));
}

/**
 * Create a simple formatted system message
 */
export function createSystemMessage(content: string, variables: Record<string, any> = {}): { 
  role: 'system'; 
  content: string; 
} {
  return {
    role: 'system',
    content: formatTemplate(content, variables),
  };
}

/**
 * Create a simple formatted user message
 */
export function createUserMessage(content: string, variables: Record<string, any> = {}): { 
  role: 'user'; 
  content: string; 
} {
  return {
    role: 'user',
    content: formatTemplate(content, variables),
  };
}

/**
 * Create a simple formatted assistant message
 */
export function createAssistantMessage(content: string, variables: Record<string, any> = {}): { 
  role: 'assistant'; 
  content: string; 
} {
  return {
    role: 'assistant',
    content: formatTemplate(content, variables),
  };
}