import React, { useState, useEffect } from 'react';
import { Language, LedgerEntry, Complaint } from './types/civic';
import { translations } from './i18n/translations';
import { Header } from './components/Header';
import { ReportIssue } from './components/ReportIssue';
import { TrackComplaint } from './components/TrackComplaint';
import { CivicPulse } from './components/CivicPulse';
import { AgentLedgerDrawer } from './components/AgentLedgerDrawer';
import { PublicUpdateModal } from './components/PublicUpdateModal';
import { ShieldCheck, Terminal, MapPin, Building2, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<'report' | 'track' | 'pulse'>('report');
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [trackedId, setTrackedId] = useState<string>('');
  const [selectedComplaintForSocial, setSelectedComplaintForSocial] = useState<Complaint | null>(null);

  // Initialize Activity Ledger with startup verification
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([
    {
      id: 'tool-init-1',
      toolName: 'lookup_ward',
      inputSummary: 'System bootstrap: Wards W12 (Navrangpura) & W27 (Maninagar)',
      outputSummary: 'Mock AMC jurisdiction verified. Ready for citizen requests.',
      status: 'success',
      timestamp: new Date().toISOString(),
      durationMs: 4,
    },
    {
      id: 'tool-init-2',
      toolName: 'lookup_department',
      inputSummary: 'System bootstrap: Departments (Roads, Waste, Light, Storm Water)',
      outputSummary: 'Department routing matrix loaded.',
      status: 'success',
      timestamp: new Date().toISOString(),
      durationMs: 2,
    },
  ]);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'gu' : 'en'));
  };

  const handleRecordLedgerEntry = (entry: LedgerEntry) => {
    setLedgerEntries((prev) => [...prev, entry]);
  };

  const handleTrackTicket = (trackingId: string) => {
    setTrackedId(trackingId);
    setActiveTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col font-sans selection:bg-teal-800 selection:text-white">
      {/* Header */}
      <Header
        lang={lang}
        onToggleLang={handleToggleLang}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenLedger={() => setIsLedgerOpen(true)}
        ledgerCount={ledgerEntries.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'report' && (
          <ReportIssue
            lang={lang}
            onRecordLedgerEntry={handleRecordLedgerEntry}
            onTrackComplaint={handleTrackTicket}
            onOpenPublicUpdate={(c) => setSelectedComplaintForSocial(c)}
          />
        )}

        {activeTab === 'track' && (
          <TrackComplaint
            lang={lang}
            initialTrackingId={trackedId}
            onRecordLedgerEntry={handleRecordLedgerEntry}
            onOpenPublicUpdate={(c) => setSelectedComplaintForSocial(c)}
          />
        )}

        {activeTab === 'pulse' && (
          <CivicPulse
            lang={lang}
            onTrackTicket={handleTrackTicket}
          />
        )}
      </main>

      {/* Floating Agent Ledger Quick Trigger */}
      <div className="fixed bottom-5 right-5 z-20">
        <button
          onClick={() => setIsLedgerOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xl border border-slate-700 transition-all hover:scale-105 cursor-pointer"
        >
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>{t.navLedger}</span>
          <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full text-[10px] font-mono border border-emerald-500/40">
            {ledgerEntries.length}
          </span>
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-[#ede8e1] border-t border-[#dcd6cc] text-slate-700 py-8 px-4 sm:px-6 mt-12 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">CivicSaarthi</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600 font-medium">{t.tagline}</span>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-600">
            <p>
              Autonomous Evidence-to-Action Municipal Agent • Ahmedabad Mock AMC Environment
            </p>
            <p className="text-slate-500 mt-0.5 font-mono">
              HACKATHON DEMO • SIMULATED DATA PERSISTENCE • NO REAL CITIZEN DATA POSTED
            </p>
          </div>
        </div>
      </footer>

      {/* Agent Activity Ledger Drawer */}
      <AgentLedgerDrawer
        isOpen={isLedgerOpen}
        onClose={() => setIsLedgerOpen(false)}
        entries={ledgerEntries}
        lang={lang}
      />

      {/* Public Update Modal */}
      {selectedComplaintForSocial && (
        <PublicUpdateModal
          isOpen={!!selectedComplaintForSocial}
          onClose={() => setSelectedComplaintForSocial(null)}
          complaint={selectedComplaintForSocial}
          lang={lang}
        />
      )}
    </div>
  );
}
