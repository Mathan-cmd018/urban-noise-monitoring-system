import app from './app';
import { config } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/db';
import { initRedis } from './config/redis';
import { startNoiseSimulation, stopNoiseSimulation } from './jobs/simulator.job';

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDatabase();

    // 2. Initialize Redis (with graceful fallback)
    initRedis();

    // 3. Start telemetry simulation engine
    startNoiseSimulation();

    // 4. Start HTTP Server
    const port = Number(process.env.PORT) || config.port;
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`[Server] Running on port ${port} in ${config.env} mode`);
      console.log(`[Server] Health check: http://localhost:${port}/api/health`);
    });

    const shutdown = async () => {
      console.log('[Server] Gracefully shutting down...');
      stopNoiseSimulation();
      server.close(async () => {
        await disconnectDatabase();
        console.log('[Server] Closed all connections.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('[Server] Fatal startup error:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
