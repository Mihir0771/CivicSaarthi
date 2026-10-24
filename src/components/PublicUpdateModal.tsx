import React, { useState } from 'react';
import { Complaint, Language } from '../types/civic';
import { translations } from '../i18n/translations';
import { X, Share2, Copy, Check, MessageSquare, AlertCircle } from 'lucide-react';

interface PublicUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint;
  lang: Language;
}

export const PublicUpdateModal: React.FC<PublicUpdateModalProps> = ({
  isOpen,
  onClose,
  complaint,
  lang,
}) => {
  const t = translations[lang];
  const [copiedText, setCopiedText] = useState(false);
  const [copiedTags, setCopiedTags] = useState(false);

  if (!isOpen) return null;

  const issueLabel = t.issues[complaint.issue] || complaint.issue;
  const postContent = `📢 Civic Attention Request | Ahmedabad\n\nIdentified Issue: ${issueLabel}\nLocality: ${complaint.area} (Ward ${complaint.ward}, ${complaint.department})\nMock Tracking ID: ${complaint.trackingId}\n\nEvidence has been recorded via CivicSaarthi for municipal attention. Kindly inspect and resolve at the earliest.\n\n[Suggested Handles: @AmdavadAMC_Civic @AMC_Ward_${complaint.ward} (Placeholders for citizen reference)]`;

  const hashtags = `#AhmedabadCivic #Amdavad #Ward${complaint.ward} #${complaint.area.replace(/\s+/g, '')} #CivicSaarthi #PublicService`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(postContent);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyTags = async () => {
    try {
      await navigator.clipboard.writeText(hashtags);
      setCopiedTags(true);
      setTimeout(() => setCopiedTags(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t.publicUpdateTitle}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {t.publicUpdateTagline}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="bg-amber-50 border-b border-amber-200/60 px-4 py-2 text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{t.draftOnlyNotice}</span>
        </div>

        {/* Content Box */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
              Prepared Post Content
            </label>
            <div className="relative">
              <textarea
                readOnly
                value={postContent}
                rows={7}
                className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none resize-none leading-relaxed"
              />
              <button
                onClick={handleCopyText}
                className="absolute top-2 right-2 px-2.5 py-1 text-xs font-semibold rounded-md bg-white border border-slate-300 shadow-xs hover:bg-slate-100 text-slate-700 flex items-center gap-1 cursor-pointer"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-500" />
                    <span>{t.copyPost}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Civic Hashtags
            </label>
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-teal-800">
              <span className="flex-1 truncate">{hashtags}</span>
              <button
                onClick={handleCopyTags}
                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white border border-slate-300 shadow-xs hover:bg-slate-100 text-slate-700 flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedTags ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-500" />
                    <span>{t.copyTags}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
