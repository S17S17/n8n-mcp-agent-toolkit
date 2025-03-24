/**
 * Registry for managing AI tools in n8n
 */

import { Tool, validateTool } from './toolSchema';

/**
 * Registry for managing and retrieving tool definitions
 */
export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  private tags: Map<string, Set<string>> = new Map();

  /**
   * Register a new tool in the registry
   * 
   * @param tool The tool definition to register
   * @returns The registered tool
   * @throws Error if a tool with the same name already exists
   */
  registerTool(tool: Tool): Tool {
    // Validate the tool
    const validatedTool = validateTool(tool);
    
    // Check if tool with same name already exists
    if (this.tools.has(validatedTool.name)) {
      throw new Error(`Tool '${validatedTool.name}' is already registered`);
    }
    
    // Add tool to registry
    this.tools.set(validatedTool.name, validatedTool);
    
    // Update tags index
    if (validatedTool.tags && validatedTool.tags.length > 0) {
      validatedTool.tags.forEach(tag => {
        if (!this.tags.has(tag)) {
          this.tags.set(tag, new Set());
        }
        this.tags.get(tag)?.add(validatedTool.name);
      });
    }
    
    return validatedTool;
  }

  /**
   * Get a tool by name
   * 
   * @param name The name of the tool to retrieve
   * @returns The tool definition or undefined if not found
   */
  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all registered tools
   * 
   * @returns Array of all registered tools
   */
  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get all tools with a specific tag
   * 
   * @param tag The tag to filter by
   * @returns Array of tools with the specified tag
   */
  getToolsByTag(tag: string): Tool[] {
    const toolNames = this.tags.get(tag);
    if (!toolNames) return [];
    
    return Array.from(toolNames).map(name => {
      const tool = this.tools.get(name);
      if (!tool) throw new Error(`Inconsistency in tool registry: tool '${name}' is referenced but not found`);
      return tool;
    });
  }

  /**
   * Unregister a tool from the registry
   * 
   * @param name The name of the tool to unregister
   * @returns true if the tool was unregistered, false if it wasn't found
   */
  unregisterTool(name: string): boolean {
    const tool = this.tools.get(name);
    if (!tool) return false;
    
    // Remove from tool index
    this.tools.delete(name);
    
    // Remove from tag index
    if (tool.tags) {
      tool.tags.forEach(tag => {
        const toolsWithTag = this.tags.get(tag);
        if (toolsWithTag) {
          toolsWithTag.delete(name);
          if (toolsWithTag.size === 0) {
            this.tags.delete(tag);
          }
        }
      });
    }
    
    return true;
  }

  /**
   * Register multiple tools at once
   * 
   * @param tools Array of tool definitions to register
   * @returns Array of registered tools
   */
  registerTools(tools: Tool[]): Tool[] {
    return tools.map(tool => this.registerTool(tool));
  }

  /**
   * Check if a tool with the given name exists
   * 
   * @param name The name of the tool to check
   * @returns true if the tool exists, false otherwise
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get all available tags in the registry
   * 
   * @returns Array of all tags
   */
  getAllTags(): string[] {
    return Array.from(this.tags.keys());
  }

  /**
   * Clear all tools from the registry
   */
  clear(): void {
    this.tools.clear();
    this.tags.clear();
  }

  /**
   * Get the number of registered tools
   * 
   * @returns Number of registered tools
   */
  get size(): number {
    return this.tools.size;
  }

  /**
   * Get the number of unique tags
   * 
   * @returns Number of unique tags
   */
  get tagCount(): number {
    return this.tags.size;
  }
}

/**
 * Create a singleton instance of the tool registry
 */
export const globalToolRegistry = new ToolRegistry();

/**
 * Register a tool in the global registry
 */
export function registerTool(tool: Tool): Tool {
  return globalToolRegistry.registerTool(tool);
}

/**
 * Get a tool from the global registry
 */
export function getTool(name: string): Tool | undefined {
  return globalToolRegistry.getTool(name);
}

/**
 * Get all tools from the global registry
 */
export function getAllTools(): Tool[] {
  return globalToolRegistry.getAllTools();
}

/**
 * Get tools by tag from the global registry
 */
export function getToolsByTag(tag: string): Tool[] {
  return globalToolRegistry.getToolsByTag(tag);
}