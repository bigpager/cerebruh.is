import { createClient, RedisClientType } from 'redis';
import { createServer } from './server';

const redis: RedisClientType<any> = createClient({
url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.connect().catch(console.error);

const app = createServer(redis);

const PORT = process.env.MCP_PORT || 3001;
app.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
});