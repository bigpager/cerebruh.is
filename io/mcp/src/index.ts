import express from 'express';
import { createClient } from 'redis';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(express.json());

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.connect().catch(console.error);

interface Memory {
  id: string;
  type: 'text' | 'voice' | 'block';
  content: string;
  context: {
    source: string;
    timestamp: number;
    confidence?: number;
  };
}

// MCP API Implementation
app.post('/mcp/observe', async (req, res) => {
  const { type, content, context } = req.body;
  const id = uuidv4();
  
  const memory: Memory = {
    id,
    type,
    content,
    context: {
      ...context,
      timestamp: context.timestamp || Date.now()
    }
  };

  await redis.hSet(`memory:${id}`, memory);
  await redis.zAdd('memories:timeline', {
    score: memory.context.timestamp,
    value: id
  });

  res.json({ id });
});

app.put('/mcp/revise/:id', async (req, res) => {
  const { id } = req.params;
  const { revision, reason } = req.body;

  const memory = await redis.hGetAll(`memory:${id}`);
  if (!memory) {
    return res.status(404).json({ error: 'Memory not found' });
  }

  const updatedMemory = {
    ...memory,
    content: revision,
    revisionReason: reason,
    revisedAt: Date.now()
  };

  await redis.hSet(`memory:${id}`, updatedMemory);
  res.sendStatus(200);
});

app.get('/mcp/recall', async (req, res) => {
  const { query, context } = req.query;
  const { recency, source, limit = 10 } = context || {};

  let memories = [];
  const timeRange = recency ? Date.now() - Number(recency) : 0;
  
  // Get recent memories from timeline
  const ids = await redis.zRangeByScore('memories:timeline', timeRange, '+inf');
  
  for (const id of ids) {
    const memory = await redis.hGetAll(`memory:${id}`);
    if (memory) {
      // Filter by source if specified
      if (source && !source.includes(memory.context?.source)) {
        continue;
      }
      memories.push(memory);
    }
    
    if (memories.length >= Number(limit)) {
      break;
    }
  }

  res.json(memories);
});

const PORT = process.env.MCP_PORT || 3002;
app.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
});