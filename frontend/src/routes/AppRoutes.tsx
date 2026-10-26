import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { StationsPage } from '../pages/StationsPage';
import { MapPage } from '../pages/MapPage';
import { ComplaintsPage } from '../pages/ComplaintsPage';
import { HotspotsPage } from '../pages/HotspotsPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { RegulationsPage } from '../pages/RegulationsPage';
import { UsersPage } from '../pages/UsersPage';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated Dashboard Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/stations" element={<StationsPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/complaints" element={<ComplaintsPage />} />
        <Route path="/hotspots" element={<HotspotsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/regulations" element={<RegulationsPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
