import { FastMCP } from 'fastmcp';
import { addCoreTools } from './tools/index.js';
import { addPlugins } from './plugins/index.js';
import { logger } from './utils/logger.js';

const server = new FastMCP({
  name: "Cerebruh",
  version: "0.1.0",
});

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