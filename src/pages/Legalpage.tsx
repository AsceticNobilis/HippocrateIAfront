import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Section {
  title: string;
  content: string | string[];
  warning?: boolean;
}

interface LegalPageProps {
  title: string;
  subtitle?: string;
  lastUpdated: string;
  sections: Section[];
  isDarkMode?: boolean;
}

export default function LegalPage({ title, subtitle, lastUpdated, sections, isDarkMode = false }: LegalPageProps) {
  const navigate = useNavigate();

  const bg = isDarkMode ? 'bg-[#1c1c1e]' : 'bg-white';
  const card = isDarkMode ? 'bg-[#2a2a2d]' : 'bg-white';
  const border = isDarkMode ? 'border-[#3a3a3d]' : 'border-[#e0e0e0]';
  const textPrimary = isDarkMode ? 'text-white' : 'text-[#1a1a1a]';
  const textSecondary = isDarkMode ? 'text-[#a8a8ad]' : 'text-[#555555]';
  const textMuted = isDarkMode ? 'text-[#6e6e73]' : 'text-[#aaaaaa]';

  return (
    <div className={`min-h-screen ${bg} ${textPrimary}`}>
      <div className="max-w-3xl mx-auto px-4 py-10">

        <button
          onClick={() => navigate('/')}
          className={`flex items-center gap-2 mb-8 text-sm ${textSecondary} transition group`}
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Retour à HippocrateIA
        </button>

        <div className={`${card} rounded-2xl p-8 mb-6 border ${border} ${!isDarkMode ? 'shadow-sm' : ''}`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold mb-2">{title}</h1>
              {subtitle && <p className={`text-sm ${textSecondary}`}>{subtitle}</p>}
            </div>
            <span className={`text-xs ${textMuted} shrink-0 mt-1`}>
              Mise à jour : {lastUpdated}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {sections.map((section, i) => (
            <div
              key={i}
              className={`rounded-2xl p-6 border ${
                section.warning
                  ? isDarkMode
                    ? 'border-yellow-500/40 bg-yellow-500/10'
                    : 'border-yellow-400 bg-yellow-100'
                  : `${card} ${border} ${!isDarkMode ? 'shadow-sm' : ''}`
              }`}
            >
              <h2 className={`text-base font-semibold mb-3 ${
                section.warning
                  ? isDarkMode ? 'text-yellow-400' : 'text-yellow-700'
                  : textPrimary
              }`}>
                {section.title}
              </h2>
              {Array.isArray(section.content) ? (
                <ul className={`space-y-2 text-sm ${textSecondary}`}>
                  {section.content.map((item, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                        section.warning
                          ? isDarkMode ? 'bg-yellow-400' : 'bg-yellow-600'
                          : isDarkMode ? 'bg-[#5a5a5f]' : 'bg-[#cccccc]'
                      }`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`text-sm leading-relaxed ${textSecondary}`}>{section.content}</p>
              )}
            </div>
          ))}
        </div>

        <div className={`mt-8 text-center text-xs ${textMuted}`}>
          © {new Date().getFullYear()} HippocrateIA — Tous droits réservés
        </div>
      </div>
    </div>
  );
}