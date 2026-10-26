import { z } from 'zod';

export const createComplaintSchema = z.object({
  category: z.enum([
    'Loud Music',
    'Construction Noise',
    'Traffic Noise',
    'Industrial Noise',
    'Event Noise',
    'Vehicle Horn',
    'Other',
  ]),
  description: z.string().min(5, 'Description must be at least 5 characters').max(1500),
  location: z.string().min(2, 'Location is required').max(200),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  reportedNoiseLevel: z.number().min(20).max(150).optional(),
  evidence: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional().default('Medium'),
});

export const updateComplaintStatusSchema = z.object({
  status: z.enum(['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected']),
  notes: z.string().min(2, 'Notes are required for status updates').max(1000),
  assignedTo: z.string().optional(),
  resolutionNotes: z.string().max(1000).optional(),
});
