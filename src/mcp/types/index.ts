export interface MCPContext {
  sessionId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface ServiceConfig {
  host: string;
  port: number;
  apiKey?: string;
}

export interface ToolResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}