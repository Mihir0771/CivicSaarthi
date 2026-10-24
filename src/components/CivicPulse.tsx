import React, { useState, useEffect } from 'react';
import { PulseMetrics, Language, Complaint } from '../types/civic';
import { translations } from '../i18n/translations';
import { Activity, ShieldAlert, BarChart3, MapPin, Building, AlertCircle, RefreshCw, RotateCcw, ArrowRight } from 'lucide-react';

interface CivicPulseProps {
  lang: Language;
  onTrackTicket: (trackingId: string) => void;
}

export const CivicPulse: React.FC<CivicPulseProps> = ({ lang, onTrackTicket }) => {
  const t = translations[lang];
  const [metrics, setMetrics] = useState<PulseMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/agent/pulse');
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching pulse metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleResetSeed = async () => {
    if (!confirm('Reset mock database to initial seed data?')) return;
    setIsResetting(true);
    try {
      await fetch('/api/agent/reset-seed', { method: 'POST' });
      await fetchMetrics();
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading || !metrics) {
    return (
      <div className="max-w-5xl mx-auto p-12 text-center flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-teal-700 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e2dcd2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
              <Activity className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              MUNICIPAL TELEMETRY
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {t.pulseTitle}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {t.pulseSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMetrics}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            title="Refresh metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetSeed}
            disabled={isResetting}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-300"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>{t.btnResetSeed}</span>
          </button>
        </div>
      </div>

      {/* Demo Disclaimer */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl px-4 py-2.5 text-xs text-amber-900 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span>{t.pulseDisclaimer}</span>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e2dcd2] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Total Complaints
          </span>
          <span className="text-3xl font-extrabold text-slate-900 font-mono">
            {metrics.totalComplaints}
          </span>
          <span className="text-[11px] text-teal-700 font-medium block mt-1">
            Recorded in local mock store
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e2dcd2] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Active / In Progress
          </span>
          <span className="text-3xl font-extrabold text-amber-600 font-mono">
            {(metrics.byStatus['Submitted'] || 0) +
              (metrics.byStatus['Assigned'] || 0) +
              (metrics.byStatus['In Progress'] || 0)}
          </span>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">
            Pending field rectification
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e2dcd2] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Resolved / Closed
          </span>
          <span className="text-3xl font-extrabold text-emerald-600 font-mono">
            {(metrics.byStatus['Resolved'] || 0) + (metrics.byStatus['Closed'] || 0)}
          </span>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">
            Inspected and addressed
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e2dcd2] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Identified Hotspots
          </span>
          <span className="text-3xl font-extrabold text-purple-700 font-mono">
            {metrics.hotspots.length}
          </span>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">
            Clustered citizen reports
          </span>
        </div>
      </div>

      {/* Grid: Category & Ward Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Breakdown by Issue */}
        <div className="bg-white p-6 rounded-2xl border border-[#e2dcd2] shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-teal-700" />
            {t.statByIssue}
          </h3>

          <div className="space-y-3">
            {Object.entries(metrics.byIssue).map(([issueKey, count]) => {
              const label = t.issues[issueKey as keyof typeof t.issues] || issueKey;
              const pct = metrics.totalComplaints > 0 ? (count / metrics.totalComplaints) * 100 : 0;

              return (
                <div key={issueKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 capitalize">{label}</span>
                    <span className="font-mono text-slate-500 font-bold">{count}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-700 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breakdown by Status */}
        <div className="bg-white p-6 rounded-2xl border border-[#e2dcd2] shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-700" />
            {t.statByStatus}
          </h3>

          <div className="space-y-3">
            {Object.entries(metrics.byStatus).map(([statusKey, count]) => {
              const label = t.statuses[statusKey as keyof typeof t.statuses] || statusKey;
              const pct = metrics.totalComplaints > 0 ? (count / metrics.totalComplaints) * 100 : 0;

              return (
                <div key={statusKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{label}</span>
                    <span className="font-mono text-slate-500 font-bold">{count}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Identified Hotspots Section */}
      <div className="bg-white p-6 rounded-2xl border border-[#e2dcd2] shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose-600" />
          {t.hotspotsTitle}
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          {t.hotspotsSub}
        </p>

        {metrics.hotspots.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No clustered hotspots identified yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {metrics.hotspots.map((spot, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between"
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    {spot.area}
                  </h4>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Ward {spot.ward} • Top issue: <span className="capitalize font-semibold text-slate-700">{t.issues[spot.primaryIssue as keyof typeof t.issues] || spot.primaryIssue}</span>
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {spot.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity List */}
      <div className="bg-white rounded-2xl border border-[#e2dcd2] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {t.recentActivity}
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {metrics.recentComplaints.map((c) => (
            <div
              key={c.trackingId}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-teal-900">
                    {c.trackingId}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {t.statuses[c.status] || c.status}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(c.filedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  <span className="font-bold capitalize">{t.issues[c.issue] || c.issue}</span> at {c.area} (Ward {c.ward}) — {c.department}
                </p>
              </div>

              <button
                onClick={() => onTrackTicket(c.trackingId)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <span>{t.btnTrackNow}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
