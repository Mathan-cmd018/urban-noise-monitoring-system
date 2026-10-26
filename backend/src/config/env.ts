import dotenv from 'dotenv';
import path from 'path';

// Attempt loading local .env if present (does nothing in production if file doesn't exist)
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5001', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/urban_noise_db',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_jwt_key_noise_monitor_2026_secure',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || '',
  simulationIntervalMs: parseInt(process.env.SIMULATION_INTERVAL_MS || '8000', 10),
  simulationEnabled: process.env.SIMULATION_ENABLED !== 'false',
};
