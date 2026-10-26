const rawApiUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
export const API_BASE_URL = rawApiUrl
  ? rawApiUrl.replace(/\/+$/, '')
  : 'http://localhost:5001/api';

export const NOISE_THRESHOLDS = {
  SAFE_MAX: 55,
  MODERATE_MAX: 70,
  HIGH_MAX: 85,
};

export const getSeverity = (db: number): 'Safe' | 'Moderate' | 'High' | 'Critical' => {
  if (db <= NOISE_THRESHOLDS.SAFE_MAX) return 'Safe';
  if (db <= NOISE_THRESHOLDS.MODERATE_MAX) return 'Moderate';
  if (db <= NOISE_THRESHOLDS.HIGH_MAX) return 'High';
  return 'Critical';
};

export const SEVERITY_COLORS = {
  Safe: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
  Moderate: 'text-amber-400 bg-amber-950/60 border-amber-800',
  High: 'text-orange-400 bg-orange-950/60 border-orange-800',
  Critical: 'text-rose-400 bg-rose-950/60 border-rose-800',
};
