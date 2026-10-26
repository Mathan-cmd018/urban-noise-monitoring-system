import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import stationRoutes from './station.routes';
import noiseRoutes from './noise.routes';
import complaintRoutes from './complaint.routes';
import hotspotRoutes from './hotspot.routes';
import regulationRoutes from './regulation.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/stations', stationRoutes);
router.use('/noise', noiseRoutes);
router.use('/complaints', complaintRoutes);
router.use('/hotspots', hotspotRoutes);
router.use('/regulations', regulationRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
