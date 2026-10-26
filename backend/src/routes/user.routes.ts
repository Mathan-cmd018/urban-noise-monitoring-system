import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateUserSchema } from '../validators/auth.validator';

const router = Router();

// Only Admin can manage users
router.use(authenticate, authorizeRoles('Admin'));

router.get('/', UserController.getAll);
router.get('/:id', UserController.getById);
router.put('/:id', validate(updateUserSchema), UserController.update);
router.delete('/:id', UserController.delete);

export default router;
