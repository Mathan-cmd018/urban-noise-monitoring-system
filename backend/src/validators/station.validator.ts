import { z } from 'zod';

export const stationSchema = z.object({
  stationId: z.string().min(2).max(20).toUpperCase(),
  name: z.string().min(2).max(100),
  location: z.string().min(2).max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  areaType: z.enum(['Residential', 'Commercial', 'Industrial', 'Silent Zone', 'Mixed Zone']),
  status: z.enum(['Active', 'Maintenance', 'Offline']).optional().default('Active'),
});

export const updateStationSchema = stationSchema.partial();
