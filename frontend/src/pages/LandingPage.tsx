import React from 'react';
import { Link } from 'react-router-dom';
import { Volume2, ShieldCheck, Activity, MapPin, Bell } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Public Header */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Urban Noise Monitor</h1>
            <p className="text-xs text-slate-400">Smart City Acoustic Governance</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors shadow-lg shadow-sky-500/20"
          >
            Citizen Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-6xl mx-auto px-8 py-20 flex flex-col items-center text-center justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <Activity className="w-3.5 h-3.5" />
          Real-Time Sensor Telemetry & Analytics
        </div>
        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
          Smart Urban Noise Monitoring &amp; <br />
          <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
            Complaint Management
          </span>
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mb-10">
          Empowering municipal authorities and citizens with live decibel telemetry, intelligent hotspot detection, automated regulatory compliance, and transparent complaint redressal.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-all shadow-xl shadow-sky-500/25"
          >
            Report Noise Pollution
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold border border-slate-700 transition-all"
          >
            Access Authority Portal
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <Activity className="w-8 h-8 text-sky-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Simulated Live IoT Telemetry</h3>
            <p className="text-sm text-slate-400">
              Station readings updated in real-time with simulated environmental noise patterns and Redis caching.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <MapPin className="w-8 h-8 text-amber-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Hotspot Intelligence</h3>
            <p className="text-sm text-slate-400">
              Automated spatial aggregation pinpointing chronic noise violators, threshold breaches, and high-risk zones.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Configurable Regulations</h3>
            <p className="text-sm text-slate-400">
              Dynamic day/night decibel thresholds across Residential, Commercial, Industrial, and Silent Zones.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
