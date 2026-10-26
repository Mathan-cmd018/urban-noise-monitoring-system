import Redis from 'ioredis';
import { config } from './env';

let redisClient: Redis | null = null;
let isRedisAvailable = false;

export const initRedis = (): Redis | null => {
  try {
    redisClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 3) {
          console.warn('[Redis] Max reconnect attempts reached. Operating in graceful fallback mode.');
          return null; // Stop retrying
        }
        return Math.min(times * 1000, 3000);
      },
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    redisClient.on('connect', () => {
      isRedisAvailable = true;
      console.log('[Redis] Connected successfully to Redis server');
    });

    redisClient.on('error', (err) => {
      isRedisAvailable = false;
      console.warn(`[Redis] Notice: Redis not reachable (${err.message}). Application running with memory/database fallback.`);
    });

    redisClient.on('close', () => {
      isRedisAvailable = false;
    });

    // Attempt initial connect
    redisClient.connect().catch((err) => {
      isRedisAvailable = false;
      console.warn(`[Redis] Initial connection attempt: ${err.message}. Graceful fallback active.`);
    });

    return redisClient;
  } catch (error: any) {
    console.warn('[Redis] Initialization error. Running in degraded fallback mode:', error.message);
    isRedisAvailable = false;
    return null;
  }
};

export const getRedisClient = (): Redis | null => redisClient;
export const checkRedisHealth = (): boolean => isRedisAvailable;
