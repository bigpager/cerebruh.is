import request from 'supertest';
import { createClient, RedisClientType } from 'redis';
import { createServer } from '../src/server';
import { Memory, RevisionRequest } from '../src/types';

jest.mock('redis', () => ({
createClient: jest.fn(() => ({
    connect: jest.fn(),
    hSet: jest.fn(),
    hGetAll: jest.fn(),
    zAdd: jest.fn(),
    zRangeByScore: jest.fn(),
}))
}));

describe('MCP Server', () => {
const redis = createClient() as jest.Mocked<RedisClientType>;
const app = createServer(redis);

beforeEach(() => {
    jest.clearAllMocks();
});

describe('POST /observe', () => {
    it('should store a new memory', async () => {
      const memory = {
        type: 'block',
        content: 'Test content',
        context: {
          source: 'test-block-123',
          timestamp: Date.now()
        }
      };

      await request(app)
        .post('/observe')
        .send(memory)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(redis.hSet).toHaveBeenCalledTimes(1);
          expect(redis.zAdd).toHaveBeenCalledTimes(1);
        });
    });

    it('should handle missing context fields', async () => {
      const memory = {
        type: 'block',
        content: 'Test content',
        context: {
          source: 'test-block-123'
        }
      };

      await request(app)
        .post('/observe')
        .send(memory)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
        const hSetCall = redis.hSet.mock.calls[0][1] as unknown as Memory;
        expect(hSetCall.context.timestamp).toBeDefined();
        });
    });
  });

  describe('PUT /revise/:id', () => {
    it('should update an existing memory', async () => {
    redis.hGetAll.mockResolvedValueOnce({
        type: 'block',
        content: 'old content',
        context: {
            source: 'test',
            timestamp: Date.now()
        }
    } as unknown as Record<string, string>);

      await request(app)
        .put('/revise/123')
        .send({
          revision: 'new content',
          reason: 'update test'
        })
        .expect(200)
        .expect(() => {
          expect(redis.hSet).toHaveBeenCalledTimes(1);
        const updatedMemory = redis.hSet.mock.calls[0][1] as unknown as Memory;
        expect(updatedMemory.content).toBe('new content');
        expect(updatedMemory.context.source).toBe('update test');
        });
    });

    it('should return 404 for non-existent memory', async () => {
      redis.hGetAll.mockResolvedValueOnce(null);

      await request(app)
        .put('/revise/nonexistent')
        .send({
          revision: 'new content',
          reason: 'update test'
        })
        .expect(404);
    });
  });

  describe('GET /recall', () => {
    it('should retrieve memories within time range', async () => {
      const now = Date.now();
      const mockMemories = ['id1', 'id2'];
      redis.zRangeByScore.mockResolvedValueOnce(mockMemories);
      redis.hGetAll
        .mockResolvedValueOnce({
            id: 'id1',
            type: 'block',
            content: 'content 1',
            context: { source: 'test', timestamp: now - 1000 }
        } as unknown as Record<string, string>)
        .mockResolvedValueOnce({
            id: 'id2',
            type: 'block', 
            content: 'content 2',
            context: { source: 'test', timestamp: now }
        } as unknown as Record<string, string>);

      await request(app)
        .get('/recall')
        .query({ recency: 3600000 }) // Last hour
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2);
          expect(res.body[0].content).toBe('content 1');
          expect(res.body[1].content).toBe('content 2');
        });
    });

    it('should filter by source', async () => {
      redis.zRangeByScore.mockResolvedValueOnce(['id1', 'id2']);
      redis.hGetAll
        .mockResolvedValueOnce({
            id: 'id1',
            type: 'block',
            content: 'content 1',
            context: { source: 'source1', timestamp: Date.now() }
        } as unknown as Record<string, string>)
        .mockResolvedValueOnce({
            id: 'id2',
            type: 'block',
            content: 'content 2', 
            context: { source: 'source2', timestamp: Date.now() }
        } as unknown as Record<string, string>);

      await request(app)
        .get('/recall')
        .query({ 
          context: JSON.stringify({ 
            source: ['source1']
          })
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].content).toBe('content 1');
        });
    });
  });
});
