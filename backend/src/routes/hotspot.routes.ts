import { Router } from 'express';
import { HotspotController } from '../controllers/hotspot.controller';

const router = Router();

router.get('/', HotspotController.getHotspots);

export default router;
