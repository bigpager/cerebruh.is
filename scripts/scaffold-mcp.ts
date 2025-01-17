import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

const MCP_ROOT = path.join(process.cwd(), 'src', 'mcp');

const FILES = {
  // Core MCP server setup
  'server.ts': `import { FastMCP } from 'fastmcp';
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
  logger.info(\`MCP server running on port \${port}\`);
}).catch(err => {
  logger.error('Failed to start MCP server:', err);
  process.exit(1);
});

export default server;`,

  // Rest of the FILES object remains the same...
  'tools/index.ts': `import { FastMCP } from 'fastmcp';
import { memosTools } from './memos';
import { linkwardenTools } from './linkwarden';
import { n8nTools } from './n8n';

export const addCoreTools = (server: FastMCP) => {
  memosTools(server);
  linkwardenTools(server);
  n8nTools(server);
};`,

  'tools/memos.ts': `import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { logger } from '../utils/logger';

export const memosTools = (server: FastMCP) => {
  server.addTool({
    name: "memos.create",
    description: "Create a new memo",
    parameters: z.object({
      content: z.string(),
      visibility: z.enum(['private', 'public']).default('private'),
      tags: z.array(z.string()).optional(),
    }),
    execute: async (args) => {
      try {
        // TODO: Implement memo creation
        logger.info('Creating memo:', args);
        return "Memo created successfully";
      } catch (error) {
        logger.error('Failed to create memo:', error);
        throw error;
      }
    },
  });
};`,

  'tools/linkwarden.ts': `import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { logger } from '../utils/logger';

export const linkwardenTools = (server: FastMCP) => {
  server.addTool({
    name: "linkwarden.save",
    description: "Save a new link",
    parameters: z.object({
      url: z.string().url(),
      title: z.string().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }),
    execute: async (args) => {
      try {
        // TODO: Implement link saving
        logger.info('Saving link:', args);
        return "Link saved successfully";
      } catch (error) {
        logger.error('Failed to save link:', error);
        throw error;
      }
    },
  });
};`,

  'tools/n8n.ts': `import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { logger } from '../utils/logger';

export const n8nTools = (server: FastMCP) => {
  server.addTool({
    name: "n8n.trigger",
    description: "Trigger an N8N workflow",
    parameters: z.object({
      workflowId: z.string(),
      payload: z.record(z.any()).optional(),
    }),
    execute: async (args) => {
      try {
        // TODO: Implement workflow triggering
        logger.info('Triggering workflow:', args);
        return "Workflow triggered successfully";
      } catch (error) {
        logger.error('Failed to trigger workflow:', error);
        throw error;
      }
    },
  });
};`,

  'utils/logger.ts': `export const logger = {
  info: (...args: any[]) => console.log(new Date().toISOString(), 'INFO:', ...args),
  error: (...args: any[]) => console.error(new Date().toISOString(), 'ERROR:', ...args),
  debug: (...args: any[]) => console.debug(new Date().toISOString(), 'DEBUG:', ...args),
  warn: (...args: any[]) => console.warn(new Date().toISOString(), 'WARN:', ...args),
};`,

  'types/index.ts': `export interface MCPContext {
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
}`,

  '../test/mcp/tools.test.ts': `import { FastMCP } from 'fastmcp';
import { addCoreTools } from '../../src/mcp/tools';

describe('MCP Tools', () => {
  let server: FastMCP;

  beforeEach(() => {
    server = new FastMCP({
      name: "Test Server",
      version: "0.1.0",
    });
    addCoreTools(server);
  });

  test('memos.create should be registered', () => {
    const tool = server.tools.find(t => t.name === 'memos.create');
    expect(tool).toBeDefined();
  });

  test('linkwarden.save should be registered', () => {
    const tool = server.tools.find(t => t.name === 'linkwarden.save');
    expect(tool).toBeDefined();
  });

  test('n8n.trigger should be registered', () => {
    const tool = server.tools.find(t => t.name === 'n8n.trigger');
    expect(tool).toBeDefined();
  });
});`,
};

async function scaffold() {
  try {
    // Create base MCP directory
    await mkdir(MCP_ROOT, { recursive: true });

    // Create subdirectories
    const dirs = ['tools', 'utils', 'types'];
    for (const dir of dirs) {
      await mkdir(path.join(MCP_ROOT, dir), { recursive: true });
    }

    // Create test directory if it doesn't exist
    await mkdir(path.join(process.cwd(), 'test', 'mcp'), { recursive: true });

    // Write all files
    for (const [filePath, content] of Object.entries(FILES)) {
      const fullPath = filePath.startsWith('../') 
        ? path.join(process.cwd(), filePath.slice(3))
        : path.join(MCP_ROOT, filePath);
      
      await writeFile(fullPath, content, 'utf8');
      console.log('Created', fullPath);
    }

    console.log('\nMCP server structure has been scaffolded successfully!');
    console.log('\nNext steps:');
    console.log('1. Review and customize the generated files');
    console.log('2. Implement the TODO sections in the tool files');
    console.log('3. Add more tests as needed');
    console.log('4. Run the test suite with: npm test');

  } catch (error) {
    console.error('Failed to scaffold MCP server:', error);
    process.exit(1);
  }
}

scaffold();