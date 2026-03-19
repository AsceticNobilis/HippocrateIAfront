import { Activity, Stethoscope, FileText } from 'lucide-react';
import { useTranslation } from '../lib/useTranslation';

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
  onQCMClick: () => void;
  isDarkMode: boolean;
}

export default function WelcomeScreen({ onSuggestionClick, onQCMClick, isDarkMode }: WelcomeScreenProps) {
  const { tr } = useTranslation();

  const suggestions = [
    { icon: Stethoscope, key: 'suggestDiagnosis', action: () => onSuggestionClick(tr('suggestDiagnosis')) },
    { icon: FileText,    key: 'suggestQCM',       action: onQCMClick },
  ];

  return (
    <div className="flex items-center justify-center w-full" style={{ minHeight: 'calc(100vh - 180px)' }}>
      <div className="flex flex-col items-center px-4 w-full max-w-4xl mx-auto">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${isDarkMode ? 'bg-[#2a2a2d]' : 'bg-[#f5f5f5] border border-[#e8e8e8]'}`}>
          <Activity size={32} className={isDarkMode ? 'text-[#a8a8ad]' : 'text-[#444444]'} />
        </div>

        <h2 className={`text-3xl font-semibold mb-3 text-center ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>
          {tr('welcomeTitle')}
        </h2>

        <p className={`text-center mb-12 max-w-md ${isDarkMode ? 'text-[#a8a8ad]' : 'text-[#555555]'}`}>
          {tr('welcomeSubtitle')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
          {suggestions.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                onClick={s.action}
                className={`p-4 rounded-xl border transition text-left group ${
                  isDarkMode
                    ? 'bg-[#2a2a2d] hover:bg-[#3a3a3d] border-transparent hover:border-[#4a4a4d]'
                    : 'bg-white hover:bg-[#fafafa] border-[#e0e0e0] hover:border-[#c0c0c0] shadow-sm'
                }`}
              >
                <Icon size={20} className={`mb-3 transition ${isDarkMode ? 'text-[#a8a8ad] group-hover:text-white' : 'text-[#444444] group-hover:text-[#1a1a1a]'}`} />
                <p className={`text-sm ${isDarkMode ? 'text-[#e8e8ed]' : 'text-[#1a1a1a]'}`}>{tr(s.key)}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}