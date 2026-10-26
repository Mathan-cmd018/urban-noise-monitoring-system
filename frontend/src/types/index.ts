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

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

export interface MonitoringStation {
  id: string;
  stationId: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  areaType: AreaType;
  status: 'Active' | 'Maintenance' | 'Offline';
  currentNoiseLevel: number;
  lastUpdated: string;
}

export interface NoiseReading {
  id: string;
  stationId: string;
  stationName?: string;
  noiseLevel: number;
  timestamp: string;
  areaType: AreaType;
  severity: NoiseSeverity;
}

export interface ComplaintTimelineItem {
  id: string;
  status: ComplaintStatus;
  notes: string;
  updatedBy: string;
  timestamp: string;
}

export interface Complaint {
  id: string;
  complaintId: string;
  userId: string;
  citizenName?: string;
  category: ComplaintCategory;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  reportedNoiseLevel?: number;
  evidence?: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignedTo?: string;
  resolutionNotes?: string;
  history?: ComplaintTimelineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Regulation {
  id: string;
  areaType: AreaType;
  dayLimit: number;
  nightLimit: number;
  effectiveFrom: string;
  updatedBy?: string;
}

export interface Hotspot {
  area: string;
  areaType: AreaType;
  averageDb: number;
  maxDb: number;
  violationCount: number;
  complaintCount: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  latitude: number;
  longitude: number;
}
