import { useState } from 'react';
import { Crown, X, Check, Loader2 } from 'lucide-react';
import { useTranslation } from '../lib/useTranslation';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  userEmail?: string;
  apiUrl?: string;
}

export default function PremiumModal({ isOpen, onClose, isDarkMode, userEmail, apiUrl = 'http://127.0.0.1:8000' }: PremiumModalProps) {
  const { tr } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const features = [
    tr('premiumFeature1'),
    tr('premiumModalFeature2'),
    tr('premiumModalFeature3'),
    tr('premiumModalFeature4'),
    tr('premiumModalFeature5'),
  ];

  const handleSubscribe = async () => {
    if (!userEmail) { setError(tr('loginToSubscribe')); return; }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiUrl}/api/stripe/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: userEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || tr('paymentError'));
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : tr('unknownError'));
      setLoading(false);
    }
  };

  const card = isDarkMode ? 'bg-[#2a2a2d]' : 'bg-[#f8f8f8]';
  const textPrimary = isDarkMode ? 'text-white' : 'text-[#1a1a1a]';
  const textSecondary = isDarkMode ? 'text-[#a8a8ad]' : 'text-[#555555]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={`relative w-full max-w-lg rounded-2xl p-6 border ${
        isDarkMode ? 'bg-[#1c1c1e] border-[#3a3a3d]' : 'bg-white border-[#e0e0e0] shadow-xl'
      }`}>
        <button onClick={onClose} className={`absolute top-4 right-4 p-2 rounded-lg transition ${isDarkMode ? 'hover:bg-[#2a2a2d]' : 'hover:bg-[#f0f0f0]'}`}>
          <X size={20} className={textSecondary} />
        </button>

        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-[#2a2a2d]' : 'bg-amber-100'}`}>
            <Crown size={32} className={isDarkMode ? 'text-amber-400' : 'text-amber-600'} />
          </div>
          <h2 className={`text-2xl font-semibold mb-2 ${textPrimary}`}>{tr('upgradeToPremium')}</h2>
          <p className={textSecondary}>{tr('premiumSubtitle')}</p>
        </div>

        <div className={`rounded-xl p-6 mb-6 border ${isDarkMode ? `${card} border-[#3a3a3d]` : `${card} border-[#e0e0e0]`}`}>
          <div className="text-center mb-6">
            <div className={`text-4xl font-bold mb-1 ${textPrimary}`}>
              9,99€<span className={`text-lg font-normal ${textSecondary}`}>/mois</span>
            </div>
            <p className={`text-sm ${textSecondary}`}>{tr('cancelAnytime')}</p>
          </div>

          <ul className="space-y-3 mb-6">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isDarkMode ? 'bg-[#3a3a3d]' : 'bg-[#e8e8e8]'}`}>
                  <Check size={14} className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'} />
                </div>
                <span className={isDarkMode ? 'text-[#e8e8ed]' : 'text-[#1a1a1a]'}>{feature}</span>
              </li>
            ))}
          </ul>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-400">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!userEmail && (
            <div className={`mb-4 p-3 rounded-lg border ${isDarkMode ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-100 border-amber-400'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>{tr('loginToSubscribe')}</p>
            </div>
          )}

          <button
            onClick={handleSubscribe}
            disabled={loading || !userEmail}
            className={`w-full py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isDarkMode ? 'bg-[#3a3a3d] hover:bg-[#4a4a4d] text-white' : 'bg-[#1a1a1a] hover:bg-[#333333] text-white'
            }`}
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> {tr('redirectingStripe')}</>
              : tr('subscribeNow')
            }
          </button>
        </div>

        <p className={`text-xs text-center ${isDarkMode ? 'text-[#6e6e73]' : 'text-[#aaaaaa]'}`}>
          {tr('stripeSecure')}
        </p>
      </div>
    </div>
  );
}