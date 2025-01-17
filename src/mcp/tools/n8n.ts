import { FastMCP } from 'fastmcp';
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
};