import { Router } from 'express';
import { NoiseController } from '../controllers/noise.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

// Public telemetry feeds
router.get('/', NoiseController.getAll);
router.get('/latest', NoiseController.getLatest);
router.get('/station/:stationId', NoiseController.getByStation);

// Ingestion endpoint (protected for authorized sensors/admins)
router.post('/', authenticate, authorizeRoles('Admin', 'Authority'), NoiseController.createReading);

export default router;
