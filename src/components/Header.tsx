import React from 'react';
import { Language } from '../types/civic';
import { translations } from '../i18n/translations';
import { ShieldAlert, FileText, Search, Activity, Terminal, Globe } from 'lucide-react';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  activeTab: 'report' | 'track' | 'pulse';
  onChangeTab: (tab: 'report' | 'track' | 'pulse') => void;
  onOpenLedger: () => void;
  ledgerCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  activeTab,
  onChangeTab,
  onOpenLedger,
  ledgerCount,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-30 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#e2dcd2]">
      {/* Top Banner Notice */}
      <div className="bg-[#1e293b] text-slate-200 px-4 py-1.5 text-xs font-medium flex items-center justify-between border-b border-slate-700">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              {t.mockBadge}
            </span>
            <span className="text-slate-300 hidden sm:inline text-[11px]">
              {t.mockDisclaimer}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-600 transition-colors cursor-pointer"
              title="Toggle English / ગુજરાતી"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'ગુજરાતી' : 'English'}</span>
            </button>

            {/* Agent Ledger Quick Button */}
            <button
              onClick={onOpenLedger}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50 transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xs:inline">{t.navLedger}</span>
              <span className="bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                {ledgerCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-700 to-emerald-800 text-white flex items-center justify-center shadow-md shadow-teal-900/10 border border-teal-600">
              <span className="font-extrabold text-lg tracking-tight">CS</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  {t.appName}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-300">
                  AMC WARD AGENT
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {t.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 p-1 bg-[#ede8e1] rounded-xl border border-[#dcd6cc] w-full md:w-auto justify-center">
          <button
            onClick={() => onChangeTab('report')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'report'
                ? 'bg-white text-teal-900 shadow-sm border border-slate-200/80 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-teal-700" />
            <span>{t.navReport}</span>
          </button>

          <button
            onClick={() => onChangeTab('track')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'track'
                ? 'bg-white text-teal-900 shadow-sm border border-slate-200/80 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-teal-700" />
            <span>{t.navTrack}</span>
          </button>

          <button
            onClick={() => onChangeTab('pulse')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pulse'
                ? 'bg-white text-teal-900 shadow-sm border border-slate-200/80 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-teal-700" />
            <span>{t.navPulse}</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
