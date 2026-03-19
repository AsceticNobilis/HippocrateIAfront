import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../lib/useTranslation';

export default function SuccessPage() {
  const { tr } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const sessionId = searchParams.get('session_id');
  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
  const isDarkMode = document.documentElement.classList.contains('dark');

  useEffect(() => {
    const verifyAndActivate = async () => {
      if (!sessionId) { setStatus('error'); return; }
      try {
        const response = await fetch(`${API_URL}/api/stripe/verify-session?session_id=${sessionId}`);
        const data = await response.json();
        if (!data.success) { setStatus('error'); return; }
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.auth.updateUser({ data: { is_premium: true, cancel_at: null } });
          await supabase.auth.refreshSession();
        }
        setStatus('success');
        setTimeout(() => navigate('/'), 3000);
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    };
    verifyAndActivate();
  }, [sessionId]);

  const bg   = isDarkMode ? 'bg-[#1c1c1e]' : 'bg-white';
  const card = isDarkMode ? 'bg-[#2a2a2d]' : 'bg-white border border-[#e0e0e0] shadow-sm';
  const textPrimary   = isDarkMode ? 'text-white' : 'text-[#1a1a1a]';
  const textSecondary = isDarkMode ? 'text-[#a8a8ad]' : 'text-[#555555]';
  const textMuted     = isDarkMode ? 'text-[#6e6e73]' : 'text-[#aaaaaa]';

  return (
    <div className={`min-h-screen ${bg} flex items-center justify-center p-4`}>
      <div className={`${card} rounded-2xl p-8 max-w-md w-full text-center`}>
        {status === 'loading' && (
          <>
            <Loader2 size={48} className="animate-spin text-[#a8a8ad] mx-auto mb-4" />
            <h2 className={`text-xl font-semibold mb-2 ${textPrimary}`}>{tr('verifyingPayment')}</h2>
            <p className={`text-sm ${textSecondary}`}>{tr('pleaseWait')}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className={`text-xl font-semibold mb-2 ${textPrimary}`}>{tr('paymentSuccess')}</h2>
            <p className={`text-sm mb-4 ${textSecondary}`}>{tr('welcomePremium')}</p>
            <p className={`text-xs ${textMuted}`}>{tr('autoRedirect')}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-2xl">✕</span>
            </div>
            <h2 className={`text-xl font-semibold mb-2 ${textPrimary}`}>{tr('paymentError')}</h2>
            <p className={`text-sm mb-6 ${textSecondary}`}>{tr('paymentErrorDesc')}</p>
            <button
              onClick={() => navigate('/')}
              className={`px-6 py-2 rounded-lg text-sm transition ${isDarkMode ? 'bg-[#3a3a3d] hover:bg-[#4a4a4d] text-white' : 'bg-[#1a1a1a] hover:bg-[#333333] text-white'}`}
            >
              {tr('backHome')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}