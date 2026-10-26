import { Router } from 'express';
import { RegulationController } from '../controllers/regulation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { regulationSchema } from '../validators/regulation.validator';

const router = Router();

// Public / Authority read
router.get('/', RegulationController.getAll);

// Admin-only updates
router.post(
  '/',
  authenticate,
  authorizeRoles('Admin'),
  validate(regulationSchema),
  RegulationController.create
);
router.put(
  '/:id',
  authenticate,
  authorizeRoles('Admin'),
  validate(regulationSchema.partial()),
  RegulationController.update
);

export default router;
