import { FastMCP } from 'fastmcp';
import { addCoreTools } from './tools/index.js';
import { addPlugins } from './plugins/index.js';
import { logger } from './utils/logger.js';

const server = new FastMCP({
  name: "Cerebruh",
  version: "0.1.0",
});

type Memory = {
  version: number;
  content: string;
}

interface MCPApi {
  // Core Memory Operations
  observe(input: {
    type: 'text' | 'voice' | 'block',
    content: string,
    context?: {
      source: string,      // e.g. 'logseq-block-123'
      timestamp: number,
      confidence?: number  // For voice transcriptions
    }
  }): Promise<{ id: string }>;

  // Belief/Memory Updates
  revise(params: {
    id: string,           // Memory ID
    revision: string,     // New content
    reason?: string       // Why the update occurred
  }): Promise<void>;

  // Querying & Retrieval
  recall(params: {
    query: string,
    context?: {
      recency?: number,   // Time window
      source?: string[],  // Filter by sources
      limit?: number
    }
  }): Promise<Array<Memory>>;
}

async function startServer() {
  // Add all tools
  await addCoreTools(server);
  await addPlugins(server);

  // Configure server options
  const port = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT) : 3627;

  try {
    await server.start({
      transportType: "sse",
      sse: {
        endpoint: "/mcp",
        port,
      },
    });
    logger.info(`MCP server running on port ${port}`);
  } catch (err) {
    logger.error('Failed to start MCP server:', err);
    process.exit(1);
  }
}

startServer();

export default server;