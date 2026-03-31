import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../lib/useTranslation';

interface FooterProps {
  isDarkMode: boolean;
}

export default function Footer({ isDarkMode }: FooterProps) {
  const navigate = useNavigate();
  const { tr } = useTranslation();

  const links = [
    { key: 'cgu',     path: '/cgu' },
    { key: 'privacy', path: '/confidentialite' },
    { key: 'legal',   path: '/mentions-legales' },
    { key: 'contact', path: '/contact' },
    { key: 'about',   path: '/a-propos' },
  ];

  return (
    <footer className={`border-t ${isDarkMode ? 'border-[#2a2a2d] bg-[#1c1c1e]' : 'border-[#e0e0e0] bg-white'} py-6`}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-6 mb-3">
          {links.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`text-sm transition ${isDarkMode ? 'text-[#a8a8ad] hover:text-white' : 'text-[#555555] hover:text-[#1a1a1a]'}`}
            >
              {tr(link.key)}
            </button>
          ))}
        </div>
        <div className={`text-center text-xs ${isDarkMode ? 'text-[#6e6e73]' : 'text-[#888888]'}`}>
          © {new Date().getFullYear()} HippocrateIA. {tr('footerRights')}{' '}
          <span className={isDarkMode ? 'text-[#5a5a5f]' : 'text-[#cccccc]'}>•</span>{' '}
          <span>{tr('footerDisclaimer')}</span>
        </div>
      </div>
    </footer>
  );
}