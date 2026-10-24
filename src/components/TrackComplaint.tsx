import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintStatus, Language, LedgerEntry } from '../types/civic';
import { translations } from '../i18n/translations';
import { Search, MapPin, Building2, Calendar, Clock, AlertTriangle, CheckCircle, RefreshCw, FileText, ChevronRight, User, ShieldCheck } from 'lucide-react';
import { WardMap } from './WardMap';

interface TrackComplaintProps {
  lang: Language;
  initialTrackingId?: string;
  onRecordLedgerEntry: (entry: LedgerEntry) => void;
  onOpenPublicUpdate?: (complaint: Complaint) => void;
}

export const TrackComplaint: React.FC<TrackComplaintProps> = ({
  lang,
  initialTrackingId,
  onRecordLedgerEntry,
  onOpenPublicUpdate,
}) => {
  const t = translations[lang];
  const [trackingId, setTrackingId] = useState(initialTrackingId || '');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demo status update state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedNextStatus, setSelectedNextStatus] = useState<ComplaintStatus>('In Progress');

  // Load if initialTrackingId provided
  useEffect(() => {
    if (initialTrackingId) {
      setTrackingId(initialTrackingId);
      handleTrack(initialTrackingId);
    }
  }, [initialTrackingId]);

  const handleTrack = async (idToTrack?: string) => {
    const id = (idToTrack || trackingId).trim();
    if (!id) return;

    setIsLoading(true);
    setError(null);
    setComplaint(null);

    try {
      const res = await fetch(`/api/agent/track/${encodeURIComponent(id)}`);
      const data = await res.json();

      if (data.ledgerEntry) {
        onRecordLedgerEntry(data.ledgerEntry);
      }

      if (!res.ok) {
        setError(data.error || t.complaintNotFound);
        return;
      }

      setComplaint(data.ticket);
      // Setup sensible next status for demo controls
      if (data.ticket.status === 'Submitted') setSelectedNextStatus('Assigned');
      else if (data.ticket.status === 'Assigned') setSelectedNextStatus('In Progress');
      else if (data.ticket.status === 'In Progress') setSelectedNextStatus('Resolved');
      else if (data.ticket.status === 'Resolved') setSelectedNextStatus('Closed');
    } catch (err: any) {
      setError(err.message || 'Network error fetching status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoStatusUpdate = async () => {
    if (!complaint) return;
    setIsUpdatingStatus(true);

    try {
      const res = await fetch('/api/agent/demo-status-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingId: complaint.trackingId,
          newStatus: selectedNextStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update status in demo');
        return;
      }

      setComplaint(data.ticket);

      // Ledger entry for demo action
      onRecordLedgerEntry({
        id: `demo-update-${Date.now()}`,
        toolName: 'get_complaint_status',
        inputSummary: `Demo transition ${complaint.trackingId} -> ${selectedNextStatus}`,
        outputSummary: `Database record updated to "${selectedNextStatus}". Added timeline audit event.`,
        status: 'success',
        timestamp: new Date().toISOString(),
        durationMs: 12,
      });

      // Update next suggested
      if (selectedNextStatus === 'Assigned') setSelectedNextStatus('In Progress');
      else if (selectedNextStatus === 'In Progress') setSelectedNextStatus('Resolved');
      else if (selectedNextStatus === 'Resolved') setSelectedNextStatus('Closed');
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'Submitted':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Assigned':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'In Progress':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Closed':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e2dcd2]">
        <div className="max-w-xl">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {t.trackTitle}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            {t.trackSubtitle}
          </p>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTrack();
          }}
          className="mt-5 flex flex-col sm:flex-row gap-2.5"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder={t.trackInputPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-sm font-mono text-slate-900 bg-slate-50/50"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !trackingId.trim()}
            className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-teal-950/10"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.loading}</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>{t.btnSearch}</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Chip */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <span>{t.quickSampleId}</span>
          <button
            onClick={() => {
              setTrackingId('AMC-2026-000123');
              handleTrack('AMC-2026-000123');
            }}
            className="px-2 py-0.5 rounded font-mono font-semibold bg-slate-100 hover:bg-slate-200 text-teal-800 border border-slate-300 transition-colors cursor-pointer text-[11px]"
          >
            AMC-2026-000123 (Seeded Pothole)
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-900 flex items-start gap-3.5 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-rose-950">
              {t.complaintNotFound}
            </h4>
            <p className="text-xs text-rose-700 mt-0.5">
              {error}
            </p>
            <p className="text-[11px] text-rose-600 mt-1 font-medium">
              {t.complaintNotFoundSub}
            </p>
          </div>
        </div>
      )}

      {/* Complaint Details Card */}
      {complaint && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-sm border border-[#e2dcd2] overflow-hidden">
            {/* Top Bar with Tracking ID & Status */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-1">
                  OFFICIAL AMC RECORD
                </span>
                <div className="flex items-center gap-3">
                  <h3 className="font-mono font-extrabold text-2xl tracking-tight text-white">
                    {complaint.trackingId}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                      complaint.status
                    )}`}
                  >
                    {t.statuses[complaint.status] || complaint.status}
                  </span>
                </div>
              </div>

              {onOpenPublicUpdate && (
                <button
                  onClick={() => onOpenPublicUpdate(complaint)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t.publicUpdateTitle}</span>
                </button>
              )}
            </div>

            {/* Status Explanation Banner */}
            <div className="bg-teal-50/70 border-b border-teal-100 px-6 py-3 flex items-center gap-2.5 text-xs text-teal-900 font-medium">
              <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
              <span>{t.statusExplanations[complaint.status] || ''}</span>
            </div>

            {/* Details Grid */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 border-b border-slate-100">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Issue Category
                </span>
                <span className="text-sm font-bold text-slate-900 block capitalize">
                  {t.issues[complaint.issue] || complaint.issue}
                </span>
                {complaint.severity && (
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1 inline-block">
                    {t.severities[complaint.severity] || complaint.severity}
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Ward & Locality
                </span>
                <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-700" />
                  {complaint.area}
                </span>
                <span className="text-xs text-slate-600 block mt-0.5 font-medium">
                  Ward: {complaint.ward}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Responsible Dept.
                </span>
                <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-teal-700" />
                  {complaint.department}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5 font-mono">
                  AMC Municipal Division
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Evidence Count
                </span>
                <span className="text-sm font-bold text-slate-900 block font-mono">
                  {complaint.evidenceCount || 1} photo records
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Filed: {new Date(complaint.filedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Description & Evidence Details */}
            <div className="p-6 border-b border-slate-100 bg-[#faf8f5]/50 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description & Context
                </h4>
                <p className="text-xs text-slate-800 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                  {complaint.description}
                </p>
              </div>

              {complaint.evidenceSummary && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Visual Evidence Summary
                  </h4>
                  <p className="text-xs text-slate-800 leading-relaxed bg-white p-3 rounded-xl border border-slate-200 font-mono text-[11px]">
                    {complaint.evidenceSummary}
                  </p>
                </div>
              )}
            </div>

            {/* Ward Geographic Context Map */}
            <div className="p-6 border-b border-slate-100 bg-white">
              <h4 className="text-sm font-extrabold text-slate-900 tracking-tight mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-700" />
                Administrative Ward Geographic Location
              </h4>
              <WardMap
                areaName={complaint.area}
                wardResult={{
                  found: true,
                  wardId: complaint.ward,
                  wardName: complaint.ward === 'W12' ? 'Navrangpura' : 'Maninagar',
                  zone: complaint.ward === 'W12' ? 'West' : 'South',
                  matchedArea: complaint.area,
                }}
                lang={lang}
              />
            </div>

            {/* Action Timeline */}
            <div className="p-6">
              <h4 className="text-sm font-extrabold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-700" />
                {t.timelineTitle}
              </h4>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {complaint.timeline &&
                  complaint.timeline.map((ev, index) => (
                    <div key={index} className="relative group">
                      <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-teal-700 border-2 border-white shadow-xs" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(
                              ev.status
                            )}`}
                          >
                            {t.statuses[ev.status] || ev.status}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {ev.actor}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(ev.timestamp).toLocaleString([], {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                          {ev.note}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* DEMO MODE: Status Progression Controls */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/60">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-amber-500 text-white">
                  DEMO MODE CONTROL
                </span>
                <h4 className="text-sm font-bold text-amber-950 mt-1">
                  {t.demoProgressionTitle}
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  {t.demoProgressionSub}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedNextStatus}
                  onChange={(e) => setSelectedNextStatus(e.target.value as ComplaintStatus)}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-amber-300 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>

                <button
                  onClick={handleDemoStatusUpdate}
                  disabled={isUpdatingStatus || selectedNextStatus === complaint.status}
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  {isUpdatingStatus ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                  <span>{t.btnUpdateStatus}</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-amber-800 mt-2 font-mono">
              Note: Simulates AMC engineer dispatch without real municipal workers. Updates <code className="bg-amber-100 px-1 rounded">/data/amc.json</code> in real time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
