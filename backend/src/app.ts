import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import apiRoutes from './routes';

const app: Application = express();

// Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration supporting Vercel, localhost, and custom CORS_ORIGIN
const configuredOrigins = (config.corsOrigin || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server, curl, Postman, health checks with no origin header
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, '');

      // Check configured origins
      if (configuredOrigins.includes(normalizedOrigin) || configuredOrigins.includes('*')) {
        return callback(null, true);
      }

      // Check Vercel deployments (*.vercel.app)
      if (/^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(normalizedOrigin)) {
        return callback(null, true);
      }

      // Check local development
      if (
        normalizedOrigin.startsWith('http://localhost:') ||
        normalizedOrigin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }

      // If development mode, allow flexibly
      if (config.env === 'development') {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: Origin ${origin} is not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Urban Noise Monitoring & Complaint Management API is operational',
    timestamp: new Date().toISOString(),
    env: config.env,
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
