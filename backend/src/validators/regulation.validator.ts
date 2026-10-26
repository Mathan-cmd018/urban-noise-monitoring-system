import { z } from 'zod';

export const regulationSchema = z.object({
  areaType: z.enum(['Residential', 'Commercial', 'Industrial', 'Silent Zone', 'Mixed Zone']),
  dayLimit: z.number().min(30).max(120),
  nightLimit: z.number().min(30).max(120),
});
