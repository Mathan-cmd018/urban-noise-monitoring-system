import { getRedisClient, checkRedisHealth } from '../config/redis';

// In-memory fallback map when Redis server is unreachable
const memoryFallbackCache = new Map<string, { val: string; expiresAt: number }>();

export class RedisService {
  /**
   * Retrieve cached value by key
   */
  static async get<T = any>(key: string): Promise<T | null> {
    const client = getRedisClient();
    if (checkRedisHealth() && client) {
      try {
        const val = await client.get(key);
        return val ? JSON.parse(val) : null;
      } catch (err: any) {
        console.warn(`[Redis Cache Error] get("${key}"):`, err.message);
      }
    }

    // Fallback to memory cache
    const item = memoryFallbackCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      memoryFallbackCache.delete(key);
      return null;
    }
    try {
      return JSON.parse(item.val);
    } catch {
      return null;
    }
  }

  /**
   * Set value in cache with optional TTL in seconds
   */
  static async set(key: string, value: any, ttlSeconds = 60): Promise<void> {
    const jsonString = JSON.stringify(value);
    const client = getRedisClient();

    if (checkRedisHealth() && client) {
      try {
        if (ttlSeconds > 0) {
          await client.set(key, jsonString, 'EX', ttlSeconds);
        } else {
          await client.set(key, jsonString);
        }
        return;
      } catch (err: any) {
        console.warn(`[Redis Cache Error] set("${key}"):`, err.message);
      }
    }

    // Memory fallback
    memoryFallbackCache.set(key, {
      val: jsonString,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Invalidate specific key
   */
  static async del(key: string): Promise<void> {
    const client = getRedisClient();
    if (checkRedisHealth() && client) {
      try {
        await client.del(key);
      } catch (err: any) {
        console.warn(`[Redis Cache Error] del("${key}"):`, err.message);
      }
    }
    memoryFallbackCache.delete(key);
  }

  /**
   * Invalidate keys matching a pattern (e.g. "noise:latest:*")
   */
  static async delPattern(pattern: string): Promise<void> {
    const client = getRedisClient();
    if (checkRedisHealth() && client) {
      try {
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
          await client.del(...keys);
        }
      } catch (err: any) {
        console.warn(`[Redis Cache Error] delPattern("${pattern}"):`, err.message);
      }
    }

    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of memoryFallbackCache.keys()) {
      if (regex.test(key)) {
        memoryFallbackCache.delete(key);
      }
    }
  }
}
