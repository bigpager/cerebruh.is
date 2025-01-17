import { FastMCP } from 'fastmcp';
import { addCoreTools } from './tools';
import { logger } from './utils/logger';

const server = new FastMCP({
  name: "Cerebruh",
  version: "0.1.0",
});

// Add all core tools
addCoreTools(server);

// Configure server options
const port = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT) : 3001;

server.start({
  transportType: "sse",
  sse: {
    endpoint: "/mcp",
    port,
  },
}).then(() => {
  logger.info(`MCP server running on port ${port}`);
}).catch(err => {
  logger.error('Failed to start MCP server:', err);
  process.exit(1);
});

export default server;