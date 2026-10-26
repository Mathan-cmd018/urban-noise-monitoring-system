import { Router } from 'express';
import { StationController } from '../controllers/station.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { stationSchema, updateStationSchema } from '../validators/station.validator';

const router = Router();

// Public / Authenticated read
router.get('/', StationController.getAll);
router.get('/:id', StationController.getById);

// Admin-only management
router.post(
  '/',
  authenticate,
  authorizeRoles('Admin'),
  validate(stationSchema),
  StationController.create
);
router.put(
  '/:id',
  authenticate,
  authorizeRoles('Admin'),
  validate(updateStationSchema),
  StationController.update
);
router.delete('/:id', authenticate, authorizeRoles('Admin'), StationController.delete);

export default router;
