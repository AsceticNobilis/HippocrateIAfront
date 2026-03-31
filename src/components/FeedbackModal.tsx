import { useState } from 'react';
import { X, ThumbsDown } from 'lucide-react';
import { useTranslation } from '../lib/useTranslation';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { correction?: string; reason?: string; category?: string }) => void;
  isDarkMode: boolean;
}

const CATEGORIES = [
  { key: 'inexact',          labelKey: 'feedbackInexact' },
  { key: 'incomplet',        labelKey: 'feedbackIncomplet' },
  { key: 'mauvaise_langue',  labelKey: 'feedbackMauvaiseLangue' },
  { key: 'hors_sujet',       labelKey: 'feedbackHorsSujet' },
];

export default function FeedbackModal({ isOpen, onClose, onSubmit, isDarkMode }: FeedbackModalProps) {
  const { tr } = useTranslation();
  const [category, setCategory] = useState('');
  const [correction, setCorrection] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({ correction, reason, category });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setCategory('');
      setCorrection('');
      setReason('');
      onClose();
    }, 1500);
  };

  const card = isDarkMode ? 'bg-[#2a2a2d] border-[#3a3a3d]' : 'bg-white border-[#e0e0e0]';
  const textPrimary = isDarkMode ? 'text-white' : 'text-[#1a1a1a]';
  const textSecondary = isDarkMode ? 'text-[#a8a8ad]' : 'text-[#555555]';
  const inputClass = `w-full rounded-lg px-3 py-2.5 text-sm border outline-none resize-none ${
    isDarkMode
      ? 'bg-[#1c1c1e] border-[#3a3a3d] text-white placeholder-[#6e6e73] focus:border-[#5a5a5f]'
      : 'bg-[#f8f8f8] border-[#e0e0e0] text-[#1a1a1a] placeholder-[#aaaaaa] focus:border-[#c0c0c0]'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={`relative w-full max-w-md rounded-2xl p-6 border ${card} shadow-xl`}>

        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-lg transition ${isDarkMode ? 'hover:bg-[#3a3a3d]' : 'hover:bg-[#f0f0f0]'}`}
        >
          <X size={18} className={textSecondary} />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-green-500 text-xl">✓</span>
            </div>
            <p className={`font-medium ${textPrimary}`}>{tr('feedbackThanks')}</p>
            <p className={`text-sm mt-1 ${textSecondary}`}>{tr('feedbackThanksDesc')}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-red-500/10' : 'bg-red-50'}`}>
                <ThumbsDown size={16} className="text-red-500" />
              </div>
              <div>
                <p className={`font-semibold text-sm ${textPrimary}`}>{tr('feedbackTitle')}</p>
                <p className={`text-xs ${textSecondary}`}>{tr('feedbackSubtitle')}</p>
              </div>
            </div>

            {/* Catégorie */}
            <div className="mb-4">
              <p className={`text-xs font-medium mb-2 ${textSecondary}`}>{tr('feedbackCategory')}</p>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setCategory(cat.key)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition border ${
                      category === cat.key
                        ? isDarkMode
                          ? 'bg-red-500/15 border-red-500/40 text-red-400'
                          : 'bg-red-50 border-red-300 text-red-600'
                        : isDarkMode
                          ? 'bg-[#1c1c1e] border-[#3a3a3d] text-[#a8a8ad] hover:border-[#5a5a5f]'
                          : 'bg-white border-[#e0e0e0] text-[#555555] hover:border-[#c0c0c0]'
                    }`}
                  >
                    {tr(cat.labelKey)}
                  </button>
                ))}
              </div>
            </div>

            {/* Correction */}
            <div className="mb-4">
              <label className={`block text-xs font-medium mb-2 ${textSecondary}`}>
                {tr('feedbackCorrection')}
              </label>
              <textarea
                value={correction}
                onChange={e => setCorrection(e.target.value)}
                placeholder={tr('feedbackCorrectionPlaceholder')}
                rows={3}
                className={inputClass}
              />
            </div>

            {/* Raison */}
            <div className="mb-5">
              <label className={`block text-xs font-medium mb-2 ${textSecondary}`}>
                {tr('feedbackReason')} <span className={textSecondary}>({tr('feedbackOptional')})</span>
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder={tr('feedbackReasonPlaceholder')}
                rows={2}
                className={inputClass}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className={`flex-1 py-2.5 rounded-lg text-sm transition ${
                  isDarkMode
                    ? 'bg-[#1c1c1e] hover:bg-[#3a3a3d] text-[#a8a8ad]'
                    : 'bg-[#f0f0f0] hover:bg-[#e8e8e8] text-[#555555]'
                }`}
              >
                {tr('back')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!category && !correction}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition bg-red-500 hover:bg-red-600 text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {tr('feedbackSubmit')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}