import { FastMCP } from 'fastmcp';
import { memosTools } from './memos';
import { linkwardenTools } from './linkwarden';
import { n8nTools } from './n8n';

export const addCoreTools = (server: FastMCP) => {
  memosTools(server);
  linkwardenTools(server);
  n8nTools(server);
};