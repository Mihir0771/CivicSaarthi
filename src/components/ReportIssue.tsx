import React, { useState, useRef, useEffect } from 'react';
import {
  GeminiAnalysisResult,
  IssueCategory,
  SeverityLevel,
  Language,
  LedgerEntry,
  Complaint,
  WardLookupResult,
} from '../types/civic';
import { translations } from '../i18n/translations';
import { extractExifGps, getDeviceLocation, GpsData } from '../utils/exif';
import { getDemoPresets, DemoPreset } from '../utils/presets';
import { WardMap } from './WardMap';
import {
  Upload,
  Camera,
  Sparkles,
  MapPin,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Search,
  Share2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react';

interface ReportIssueProps {
  lang: Language;
  onRecordLedgerEntry: (entry: LedgerEntry) => void;
  onTrackComplaint: (trackingId: string) => void;
  onOpenPublicUpdate: (complaint: Complaint) => void;
}

export const ReportIssue: React.FC<ReportIssueProps> = ({
  lang,
  onRecordLedgerEntry,
  onTrackComplaint,
  onOpenPublicUpdate,
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Flow State: 'upload' | 'analyzing' | 'review' | 'receipt'
  const [currentStep, setCurrentStep] = useState<'upload' | 'analyzing' | 'review' | 'receipt'>('upload');

  // Image data
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');

  // EXIF & GPS
  const [gpsData, setGpsData] = useState<GpsData | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Analysis result
  const [analysis, setAnalysis] = useState<GeminiAnalysisResult | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<IssueCategory>('garbage');
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Area & Routing
  const [areaInput, setAreaInput] = useState<string>('Navrangpura');
  const [wardResult, setWardResult] = useState<WardLookupResult | null>(null);
  const [department, setDepartment] = useState<string>('Solid Waste Management');
  const [isResolvingRouting, setIsResolvingRouting] = useState(false);

  // Civic Memory (Duplicate detection)
  const [duplicateComplaint, setDuplicateComplaint] = useState<Complaint | null>(null);
  const [civicMemoryChoice, setCivicMemoryChoice] = useState<'corroborate' | 'different' | null>(null);

  // Final ticket submission
  const [isFiling, setIsFiling] = useState(false);
  const [filedReceipt, setFiledReceipt] = useState<Complaint | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Demo presets
  const presets = getDemoPresets();

  // Supported area quick chips
  const supportedAreas = [
    { name: 'Navrangpura', ward: 'W12' },
    { name: 'Stadium', ward: 'W12' },
    { name: 'CG Road', ward: 'W12' },
    { name: 'Maninagar', ward: 'W27' },
    { name: 'Kankaria', ward: 'W27' },
    { name: 'Jawahar Chowk', ward: 'W27' },
  ];

  // Helper to handle uploaded image file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    const mime = file.type;
    setImageMime(mime);

    // Read EXIF GPS
    const gps = await extractExifGps(file);
    if (gps) {
      setGpsData(gps);
      if (gps.suggestedArea) setAreaInput(gps.suggestedArea);
    } else {
      setGpsData(null);
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      startAnalysis(dataUrl, mime);
    };
    reader.readAsDataURL(file);
  };

  // Helper to load preset demo scenario
  const handleSelectPreset = (preset: DemoPreset) => {
    setImagePreview(preset.dataUrl);
    setImageMime('image/jpeg');
    setAreaInput(preset.suggestedArea);

    if (preset.simulatedGps) {
      setGpsData({
        latitude: preset.simulatedGps.latitude,
        longitude: preset.simulatedGps.longitude,
        suggestedArea: preset.suggestedArea,
        formattedCoordinates: preset.simulatedGps.formatted,
      });
    } else {
      setGpsData(null);
    }

    startAnalysis(preset.dataUrl, 'image/jpeg', preset.suggestedArea);
  };

  // Trigger server-side Gemini image analysis
  const startAnalysis = async (imageDataUrl: string, mime: string, areaOverride?: string) => {
    setCurrentStep('analyzing');
    setAnalysisError(null);
    setAnalysis(null);
    setDuplicateComplaint(null);
    setCivicMemoryChoice(null);

    try {
      const res = await fetch('/api/agent/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageDataUrl,
          mimeType: mime,
        }),
      });

      const data = await res.json();

      if (data.ledgerEntry) {
        onRecordLedgerEntry(data.ledgerEntry);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Gemini image analysis failed.');
      }

      const result: GeminiAnalysisResult = data.analysis;
      setAnalysis(result);
      setSelectedIssue(result.issue);

      // Now resolve routing and Civic Memory with current area
      const targetArea = areaOverride || areaInput || 'Navrangpura';
      await resolveRouting(targetArea, result.issue);

      setCurrentStep('review');
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || 'Image analysis encountered an error. Please try again.');
      setCurrentStep('upload');
    }
  };

  // Resolve routing and Civic Memory duplicates
  const resolveRouting = async (area: string, issue: IssueCategory) => {
    setIsResolvingRouting(true);
    try {
      const res = await fetch('/api/agent/resolve-routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          areaName: area,
          issue: issue,
        }),
      });

      const data = await res.json();

      if (data.ledgerEntries && Array.isArray(data.ledgerEntries)) {
        data.ledgerEntries.forEach((entry: LedgerEntry) => onRecordLedgerEntry(entry));
      }

      setWardResult(data.ward);
      setDepartment(data.department);
      setDuplicateComplaint(data.duplicateComplaint);

      // Default to corroborate if duplicate found
      if (data.duplicateComplaint) {
        setCivicMemoryChoice('corroborate');
      } else {
        setCivicMemoryChoice(null);
      }
    } catch (err) {
      console.error('Error resolving routing:', err);
    } finally {
      setIsResolvingRouting(false);
    }
  };

  // Device GPS extraction with permission
  const handleDetectDeviceGps = async () => {
    setIsDetectingGps(true);
    try {
      const gps = await getDeviceLocation();
      setGpsData(gps);
      if (gps.suggestedArea) {
        setAreaInput(gps.suggestedArea);
        if (analysis) {
          resolveRouting(gps.suggestedArea, selectedIssue);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Unable to access device GPS');
    } finally {
      setIsDetectingGps(false);
    }
  };

  // Confirm and file ticket (or corroborate)
  const handleFileTicket = async () => {
    if (!analysis || !imagePreview) return;

    if (!wardResult || !wardResult.found || !wardResult.wardId) {
      alert(t.unknownAreaHelp);
      return;
    }

    setIsFiling(true);

    try {
      // If user chose to corroborate duplicate
      if (duplicateComplaint && civicMemoryChoice === 'corroborate') {
        const res = await fetch('/api/agent/add-evidence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trackingId: duplicateComplaint.trackingId,
            evidenceSummary: analysis.evidenceSummary,
            imageData: imagePreview,
          }),
        });

        const data = await res.json();
        if (data.ledgerEntry) onRecordLedgerEntry(data.ledgerEntry);

        if (!res.ok) throw new Error(data.error || 'Failed to add evidence');

        setFiledReceipt(data.ticket);
        setCurrentStep('receipt');
        return;
      }

      // Otherwise, file a brand-new complaint ticket
      const res = await fetch('/api/agent/create-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wardId: wardResult.wardId,
          issue: selectedIssue,
          area: wardResult.matchedArea || areaInput,
          department: department,
          description: analysis.description,
          severity: analysis.severity,
          evidenceSummary: analysis.evidenceSummary,
          imageData: imagePreview,
        }),
      });

      const data = await res.json();
      if (data.ledgerEntry) onRecordLedgerEntry(data.ledgerEntry);

      if (!res.ok) throw new Error(data.error || 'Failed to file ticket');

      setFiledReceipt(data.ticket);
      setCurrentStep('receipt');
    } catch (err: any) {
      alert(err.message || 'Error communicating with mock AMC service');
    } finally {
      setIsFiling(false);
    }
  };

  // Copy tracking ID
  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // Reset to file another report
  const handleResetFlow = () => {
    setImagePreview(null);
    setAnalysis(null);
    setWardResult(null);
    setDuplicateComplaint(null);
    setCivicMemoryChoice(null);
    setFiledReceipt(null);
    setAnalysisError(null);
    setCurrentStep('upload');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Stepper */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e2dcd2] shadow-xs">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-xs font-bold">
          <div
            className={`p-2 rounded-xl border transition-all ${
              currentStep === 'upload'
                ? 'bg-teal-50 border-teal-500 text-teal-900'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            {t.stepUpload}
          </div>
          <div
            className={`p-2 rounded-xl border transition-all ${
              currentStep === 'analyzing'
                ? 'bg-teal-50 border-teal-500 text-teal-900 animate-pulse'
                : analysis
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            {t.stepAnalyze}
          </div>
          <div
            className={`p-2 rounded-xl border transition-all ${
              currentStep === 'review'
                ? 'bg-teal-50 border-teal-500 text-teal-900'
                : wardResult?.found
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            {t.stepLocation}
          </div>
          <div
            className={`p-2 rounded-xl border transition-all hidden sm:block ${
              duplicateComplaint
                ? 'bg-amber-50 border-amber-400 text-amber-900'
                : currentStep === 'review'
                ? 'bg-teal-50 border-teal-500 text-teal-900'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            {t.stepReview}
          </div>
          <div
            className={`p-2 rounded-xl border transition-all ${
              currentStep === 'receipt'
                ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-extrabold shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            {t.stepReceipt}
          </div>
        </div>
      </div>

      {/* STEP 1: Upload Card & Presets */}
      {currentStep === 'upload' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Main Hero Header */}
          <div className="text-center max-w-2xl mx-auto pt-2 pb-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t.headline}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">
              {t.subheadline}
            </p>
          </div>

          {/* Analysis Error Notification if any */}
          {analysisError && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-rose-950">AI Analysis Error</h4>
                <p className="text-xs text-rose-700 mt-0.5">{analysisError}</p>
                <p className="text-[11px] text-rose-600 mt-1 font-medium">
                  Check server Gemini API key or try again with a clear photo.
                </p>
              </div>
            </div>
          )}

          {/* Upload Dropzone */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-dashed border-[#dcd6cc] hover:border-teal-700 transition-all text-center shadow-xs">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-4 border border-teal-200 shadow-xs">
              <Camera className="w-8 h-8" />
            </div>

            <h3 className="text-base font-extrabold text-slate-900">
              {t.uploadTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {t.uploadSubtitle}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all shadow-sm shadow-teal-950/10 flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{t.browsePhoto}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 font-mono">
              Accepts JPEG, PNG, WebP • Max 15MB
            </p>
          </div>

          {/* Quick Demo Presets */}
          <div className="bg-white rounded-2xl p-6 border border-[#e2dcd2] shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                {t.presetTitle}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              {t.presetHint}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-700 hover:bg-teal-50/30 text-left transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-teal-950">
                        {preset.title}
                      </span>
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {preset.suggestedArea}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                      {preset.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-teal-800 font-bold">
                    <span>Inspect Scenario</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Analyzing State */}
      {currentStep === 'analyzing' && (
        <div className="bg-white rounded-2xl p-10 border border-[#e2dcd2] shadow-sm text-center space-y-4 animate-in fade-in">
          {imagePreview && (
            <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden border-2 border-teal-600 shadow-md">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 text-teal-700 animate-spin" />
            <h3 className="text-base font-extrabold text-slate-900">
              {t.analyzingTitle}
            </h3>
          </div>

          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {t.analyzingSub}
          </p>

          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            {t.geminiPowered}
          </span>
        </div>
      )}

      {/* STEP 3 & 4: Review, Ward Routing & Civic Memory */}
      {currentStep === 'review' && analysis && (
        <div className="space-y-6 animate-in fade-in">
          {/* Card: AI Inspection Result */}
          <div className="bg-white rounded-2xl p-6 border border-[#e2dcd2] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Uploaded Evidence"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                  />
                )}
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-700 block">
                    GEMINI MULTIMODAL CLASSIFICATION
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 capitalize">
                    {t.issues[selectedIssue] || selectedIssue}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Quality: <span className="font-semibold text-slate-700 capitalize">{analysis.imageQuality}</span>
                  </p>
                </div>
              </div>

              {/* Confidence & Severity Badges */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[100px]">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">
                    Confidence
                  </span>
                  <span className="text-sm font-mono font-extrabold text-teal-900">
                    {(analysis.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[100px]">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">
                    Severity
                  </span>
                  <span className="text-sm font-bold text-amber-700 capitalize">
                    {analysis.severity}
                  </span>
                </div>
              </div>
            </div>

            {/* Confidence Threshold Warning Gate */}
            {analysis.needsConfirmation && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-950 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <span className="font-bold block text-amber-900">
                    {t.confirmationNotice}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs text-amber-800 font-medium">
                      {t.overrideIssue}:
                    </span>
                    {(['pothole', 'garbage', 'streetlight', 'waterlogging', 'other'] as IssueCategory[]).map(
                      (cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setSelectedIssue(cat);
                            resolveRouting(areaInput, cat);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            selectedIssue === cat
                              ? 'bg-amber-700 text-white shadow-xs'
                              : 'bg-white border border-amber-300 text-amber-900 hover:bg-amber-100'
                          }`}
                        >
                          {t.issues[cat]}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Description & Evidence Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Visual Description
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {analysis.description}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {t.evidenceLabel}
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-mono text-[11px]">
                  {analysis.evidenceSummary}
                </p>
              </div>
            </div>
          </div>

          {/* Card: Location & Ward Resolution */}
          <div className="bg-white rounded-2xl p-6 border border-[#e2dcd2] shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {t.locationTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.locationSub}
              </p>
            </div>

            {/* Area input & Device GPS button */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={areaInput}
                    onChange={(e) => {
                      setAreaInput(e.target.value);
                      resolveRouting(e.target.value, selectedIssue);
                    }}
                    placeholder={t.areaPlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-xs font-semibold text-slate-900 bg-slate-50/50"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleDetectDeviceGps}
                  disabled={isDetectingGps}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-700" />
                  <span>{isDetectingGps ? t.detectingGps : t.detectGps}</span>
                </button>
              </div>

              {/* GPS metadata feedback if available */}
              {gpsData && (
                <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center justify-between">
                  <span className="font-mono text-[11px]">
                    📍 Coordinates: {gpsData.formattedCoordinates}
                  </span>
                  <span className="text-[10px] text-teal-700">
                    {t.gpsDisclaimer}
                  </span>
                </div>
              )}

              {/* Supported Area Chips */}
              <div>
                <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                  Supported Ahmedabad Municipal Areas:
                </span>
                <div className="flex flex-wrap gap-2">
                  {supportedAreas.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        setAreaInput(item.name);
                        resolveRouting(item.name, selectedIssue);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        areaInput.toLowerCase() === item.name.toLowerCase()
                          ? 'bg-teal-800 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {item.name} ({item.ward})
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {t.supportedAreasHint}
                </p>
              </div>
            </div>

            {/* Interactive Open-Source Leaflet Ward Map */}
            <WardMap
              areaName={areaInput}
              wardResult={wardResult}
              lang={lang}
              onSelectArea={(selectedArea) => {
                setAreaInput(selectedArea);
                resolveRouting(selectedArea, selectedIssue);
              }}
            />

            {/* Routing Resolution Results */}
            {wardResult && wardResult.found ? (
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-950">
                      {t.wardMatched}: Ward {wardResult.wardId} ({wardResult.wardName}, Zone: {wardResult.zone})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-950">
                      {t.deptAssigned}: {department}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-800">
                  <span className="font-bold">{t.whyRoute}:</span> {t.routeExplanation}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">{t.unknownAreaError}</span>
                  <span className="text-rose-700 mt-0.5 block">{t.unknownAreaHelp}</span>
                </div>
              </div>
            )}
          </div>

          {/* Card: Distinctive Feature — Civic Memory (Duplicate Alert) */}
          {duplicateComplaint && (
            <div className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-300 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-amber-950">
                    {t.civicMemoryTitle}
                  </h3>
                  <p className="text-xs text-amber-800 mt-0.5">
                    {t.civicMemoryAlert}
                  </p>
                </div>
              </div>

              {/* Matched Ticket Details */}
              <div className="p-4 rounded-xl bg-white border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-mono font-bold text-amber-900 block text-sm">
                    {duplicateComplaint.trackingId}
                  </span>
                  <span className="text-slate-600 block mt-0.5">
                    {t.issues[duplicateComplaint.issue] || duplicateComplaint.issue} • {duplicateComplaint.area} (Ward {duplicateComplaint.ward})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    Status: {t.statuses[duplicateComplaint.status] || duplicateComplaint.status}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {duplicateComplaint.evidenceCount || 1} existing reports
                  </span>
                </div>
              </div>

              <p className="text-xs text-amber-900 leading-relaxed">
                {t.duplicateExplanation}
              </p>

              {/* Two Explicit User Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCivicMemoryChoice('corroborate')}
                  className={`p-3.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                    civicMemoryChoice === 'corroborate'
                      ? 'bg-amber-700 text-white border-amber-800 shadow-md ring-2 ring-amber-500'
                      : 'bg-white border-amber-300 text-amber-950 hover:bg-amber-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{t.btnCorroborate}</span>
                  </div>
                  <span className={`text-[11px] block font-normal ${civicMemoryChoice === 'corroborate' ? 'text-amber-100' : 'text-amber-800'}`}>
                    Adds your photograph as corroborating evidence without filing an extra ticket.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCivicMemoryChoice('different')}
                  className={`p-3.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                    civicMemoryChoice === 'different'
                      ? 'bg-slate-800 text-white border-slate-900 shadow-md ring-2 ring-slate-500'
                      : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>{t.btnDifferentIncident}</span>
                  </div>
                  <span className={`text-[11px] block font-normal ${civicMemoryChoice === 'different' ? 'text-slate-300' : 'text-slate-600'}`}>
                    Creates a completely new ticket with a new tracking ID.
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Submission Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={handleResetFlow}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer w-full sm:w-auto"
            >
              {t.cancel}
            </button>

            <button
              type="button"
              onClick={handleFileTicket}
              disabled={isFiling || !wardResult?.found}
              className="px-8 py-3 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-extrabold tracking-wide uppercase shadow-md shadow-teal-950/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
            >
              {isFiling ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.filingTitle}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>
                    {duplicateComplaint && civicMemoryChoice === 'corroborate'
                      ? 'Add Proof to Existing Ticket'
                      : t.btnConfirmAndFile}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Ticket Receipt */}
      {currentStep === 'receipt' && filedReceipt && (
        <div className="bg-white rounded-2xl border border-[#e2dcd2] shadow-sm overflow-hidden animate-in fade-in space-y-6 p-6 sm:p-8">
          {/* Header */}
          <div className="text-center max-w-lg mx-auto space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-300 shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {t.receiptTitle}
            </h2>
            <p className="text-xs text-slate-600">
              {t.receiptSubtitle}
            </p>
          </div>

          {/* Tracking ID Badge */}
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-900 text-white text-center shadow-md">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-1">
              {t.trackingIdLabel}
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono font-extrabold text-2xl text-amber-300 tracking-tight">
                {filedReceipt.trackingId}
              </span>
              <button
                onClick={() => handleCopyId(filedReceipt.trackingId)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                title={t.copyId}
              >
                {copiedId ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Details Summary Table */}
          <div className="max-w-xl mx-auto rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
            <div className="p-3 flex justify-between bg-slate-50">
              <span className="font-bold text-slate-600">Issue Category:</span>
              <span className="font-bold text-slate-900 capitalize">
                {t.issues[filedReceipt.issue] || filedReceipt.issue}
              </span>
            </div>
            <div className="p-3 flex justify-between">
              <span className="font-bold text-slate-600">Administrative Ward:</span>
              <span className="font-mono font-bold text-teal-800">
                Ward {filedReceipt.ward} ({filedReceipt.area})
              </span>
            </div>
            <div className="p-3 flex justify-between bg-slate-50">
              <span className="font-bold text-slate-600">Assigned Department:</span>
              <span className="font-bold text-slate-900">
                {filedReceipt.department}
              </span>
            </div>
            <div className="p-3 flex justify-between">
              <span className="font-bold text-slate-600">Recorded Status:</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {t.statuses[filedReceipt.status] || filedReceipt.status}
              </span>
            </div>
            <div className="p-3 flex justify-between bg-slate-50">
              <span className="font-bold text-slate-600">Submission Timestamp:</span>
              <span className="font-mono text-slate-600">
                {new Date(filedReceipt.filedAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => onTrackComplaint(filedReceipt.trackingId)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Search className="w-4 h-4" />
              <span>{t.btnTrackNow}</span>
            </button>

            <button
              onClick={() => onOpenPublicUpdate(filedReceipt)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              <span>{t.publicUpdateTitle}</span>
            </button>

            <button
              onClick={handleResetFlow}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              {t.btnFileAnother}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
