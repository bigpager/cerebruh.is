import express from 'express';
import { RedisClientType } from 'redis';
import { v4 as uuidv4 } from 'uuid';
import { Memory } from './types';

// Helper functions for Redis serialization/deserialization
function serializeMemory(memory: Memory): Record<string, string> {
return {
    id: memory.id,
    type: memory.type,
    content: memory.content,
    context: JSON.stringify(memory.context)
};
}

function deserializeMemory(record: Record<string, string>): Memory {
return {
    id: record.id,
    type: record.type as Memory['type'],
    content: record.content,
    context: JSON.parse(record.context)
};
}

export function createServer(redis: RedisClientType<any>) {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_, res) => res.send('ok'));

  // MCP API Implementation
  app.post('/observe', async (req, res) => {
    const { type, content, context } = req.body;
    const id = uuidv4();
    console.log(`observe... ${id}`);
    const memory: Memory = {
      id,
      type,
      content,
      context: {
        ...context,
        timestamp: context.timestamp || Date.now()
      }
    };

    await redis.hSet(`memory:${id}`, serializeMemory(memory));
    await redis.zAdd('memories:timeline', [{
    score: memory.context.timestamp,
    value: id
    }]);

    res.json({ id });
  });

  app.put('/revise/:id', async (req, res) => {
    const { id } = req.params;
    const { revision, reason } = req.body;

    const record = await redis.hGetAll(`memory:${id}`);
    if (!record || !record.id) {
    return res.status(404).json({ error: 'Memory not found' });
    }

    const memory = deserializeMemory(record);
    const updatedMemory: Memory = {
    ...memory,
    content: revision,
    context: {
        ...memory.context,
        revisionReason: reason,
        revisedAt: Date.now()
    }
    };

    await redis.hSet(`memory:${id}`, serializeMemory(updatedMemory));
    res.sendStatus(200);
  });

  app.get('/recall', async (req, res) => {
    const { recency, source, limit = 10 } = req.query;
    let memories = [];
    const timeRange = recency ? Date.now() - Number(recency) : 0;
    
    const ids = await redis.zRangeByScore('memories:timeline', timeRange.toString(), '+inf');
    
    for (const id of ids) {
    const record = await redis.hGetAll(`memory:${id}`);
    if (record && record.id) {
    const memory = deserializeMemory(record);
    // Filter by source if specified
    if (source) {
        const sources = Array.isArray(source) ? source : [source];
        if (!sources.includes(memory.context.source)) {
        continue;
        }
    }
    memories.push(memory);
      }
      
      if (memories.length >= Number(limit)) {
        break;
      }
    }

    res.json(memories);
  });

  return app;
}
