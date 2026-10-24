import React from 'react';
import { LedgerEntry, Language } from '../types/civic';
import { translations } from '../i18n/translations';
import { X, Terminal, CheckCircle2, AlertCircle, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

interface AgentLedgerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LedgerEntry[];
  lang: Language;
}

export const AgentLedgerDrawer: React.FC<AgentLedgerDrawerProps> = ({
  isOpen,
  onClose,
  entries,
  lang,
}) => {
  const t = translations[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-lg bg-[#0f172a] text-slate-100 h-full flex flex-col shadow-2xl border-l border-slate-700 animate-in slide-in-from-right duration-200">
        {/* Ledger Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {t.ledgerTitle}
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                  REAL-TIME AUDIT
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {t.ledgerSub}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={t.closeLedger}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit info banner */}
        <div className="bg-slate-950/70 px-4 py-2 text-[11px] text-slate-400 border-b border-slate-800 flex items-center justify-between font-mono">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            Server Tool Invocations: {entries.length}
          </span>
          <span className="text-slate-500">Autonomous Server Loop</span>
        </div>

        {/* Ledger Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
          {entries.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 border border-dashed border-slate-800 rounded-xl">
              <Terminal className="w-10 h-10 text-slate-600 mb-2 stroke-1" />
              <p className="text-xs">{t.ledgerEmpty}</p>
            </div>
          ) : (
            entries.slice().reverse().map((entry, idx) => {
              const isSuccess = entry.status === 'success';
              const isFailed = entry.status === 'failed';
              const timeStr = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

              return (
                <div
                  key={entry.id || idx}
                  className={`rounded-xl border p-3.5 transition-all text-xs ${
                    isFailed
                      ? 'bg-rose-950/20 border-rose-800/60'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      {isSuccess ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span className="font-mono font-bold text-amber-300 text-xs tracking-tight">
                        {entry.toolName}()
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        {entry.durationMs}ms
                      </span>
                      <span className="text-slate-600">|</span>
                      <span>{timeStr}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500 font-semibold">{t.inputLabel}:</span>{' '}
                      <span className="text-slate-300">{entry.inputSummary}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">{t.outputLabel}:</span>{' '}
                      <span className={isFailed ? 'text-rose-300 font-semibold' : 'text-emerald-300'}>
                        {entry.outputSummary}
                      </span>
                    </div>
                  </div>

                  {entry.details && Object.keys(entry.details).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800/60">
                      <details className="text-[10px] font-mono text-slate-400">
                        <summary className="cursor-pointer hover:text-slate-200">
                          View Execution Context
                        </summary>
                        <pre className="mt-1.5 p-2 rounded bg-slate-950 text-slate-300 overflow-x-auto text-[10px]">
                          {JSON.stringify(entry.details, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <span>CivicSaarthi Autonomous Ledger</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
          >
            {t.closeLedger}
          </button>
        </div>
      </div>
    </div>
  );
};
