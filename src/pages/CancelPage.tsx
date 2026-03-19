import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { useTranslation } from '../lib/useTranslation';

export default function CancelPage() {
  const navigate = useNavigate();
  const { tr } = useTranslation();
  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1c1c1e]' : 'bg-white'} flex items-center justify-center p-4`}>
      <div className={`${isDarkMode ? 'bg-[#2a2a2d]' : 'bg-white border border-[#e0e0e0] shadow-sm'} rounded-2xl p-8 max-w-md w-full text-center`}>
        <XCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>{tr('cancelPayment')}</h2>
        <p className={`text-sm mb-6 ${isDarkMode ? 'text-[#a8a8ad]' : 'text-[#555555]'}`}>{tr('cancelPaymentDesc')}</p>
        <button onClick={() => navigate('/')} className={`px-6 py-2 rounded-lg text-sm transition ${isDarkMode ? 'bg-[#3a3a3d] hover:bg-[#4a4a4d] text-white' : 'bg-[#1a1a1a] hover:bg-[#333333] text-white'}`}>
          {tr('backHome')}
        </button>
      </div>
    </div>
  );
}