export type UserRole = 'Admin' | 'Authority' | 'Citizen';

export type AreaType = 'Residential' | 'Commercial' | 'Industrial' | 'Silent Zone' | 'Mixed Zone';

export type NoiseSeverity = 'Safe' | 'Moderate' | 'High' | 'Critical';

export type ComplaintCategory =
  | 'Loud Music'
  | 'Construction Noise'
  | 'Traffic Noise'
  | 'Industrial Noise'
  | 'Event Noise'
  | 'Vehicle Horn'
  | 'Other';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}
