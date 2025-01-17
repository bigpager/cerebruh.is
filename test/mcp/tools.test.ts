import { FastMCP } from 'fastmcp';
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
});