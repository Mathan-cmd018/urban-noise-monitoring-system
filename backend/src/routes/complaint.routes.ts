import { Router } from 'express';
import { ComplaintController } from '../controllers/complaint.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createComplaintSchema,
  updateComplaintStatusSchema,
} from '../validators/complaint.validator';

const router = Router();

router.use(authenticate);

// View complaints & specific complaint
router.get('/', ComplaintController.getAll);
router.get('/:id', ComplaintController.getById);

// Submit new complaint (Citizens and above)
router.post('/', validate(createComplaintSchema), ComplaintController.create);

// Update status & notes (Authorities and Admins only)
router.patch(
  '/:id/status',
  authorizeRoles('Authority', 'Admin'),
  validate(updateComplaintStatusSchema),
  ComplaintController.updateStatus
);

// General edit
router.put('/:id', authorizeRoles('Authority', 'Admin'), ComplaintController.update);

export default router;
