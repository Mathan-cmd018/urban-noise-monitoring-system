import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

// Overview is accessible to authenticated users
router.get('/overview', AnalyticsController.getOverview);

// Detailed analytics accessible to Authority and Admin
router.get('/noise', authenticate, authorizeRoles('Authority', 'Admin'), AnalyticsController.getNoiseAnalytics);
router.get(
  '/complaints',
  authenticate,
  authorizeRoles('Authority', 'Admin'),
  AnalyticsController.getComplaintAnalytics
);
router.get(
  '/compliance',
  authenticate,
  authorizeRoles('Authority', 'Admin'),
  AnalyticsController.getComplianceAnalytics
);

export default router;
