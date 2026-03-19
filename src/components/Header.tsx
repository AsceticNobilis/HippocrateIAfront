import { useState, useRef, useEffect } from 'react';
import { Activity, Crown, Menu, Moon, Sun, User, LogOut, ChevronDown, Shield, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { AvatarSvg } from '../lib/avatars';
import { LANGUAGES, type Lang } from '../lib/i18n';
import { useTranslation } from '../lib/useTranslation';

const ADMIN_EMAIL = 'mopinab@gmail.com';
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

interface HeaderProps {
  isPremium: boolean;
  remainingPrompts: number;
  onUpgradeClick: () => void;
  onToggleSidebar: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onAuthClick: () => void;
  isAuthenticated: boolean;
  userEmail?: string;
  userFullName?: string;
  userAvatarId?: string;
}

export default function Header({
  isPremium, remainingPrompts, onUpgradeClick, onToggleSidebar,
  isDarkMode, onToggleDarkMode, onAuthClick, isAuthenticated,
  userEmail, userFullName, userAvatarId = 'capybara'
}: HeaderProps) {
  const { tr, lang, setLang } = useTranslation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPlanMenu, setShowPlanMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [cancelAt, setCancelAt] = useState<number | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const planMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      const ts = user?.user_metadata?.cancel_at;
      if (ts && isPremium && ts * 1000 > Date.now()) setCancelAt(ts);
      else setCancelAt(null);
    });
  }, [isPremium]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (planMenuRef.current && !planMenuRef.current.contains(e.target as Node)) { setShowPlanMenu(false); setShowConfirm(false); }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) setShowLangMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const daysRemaining = cancelAt
    ? Math.max(0, Math.ceil((cancelAt * 1000 - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const handleLogout = async () => { setShowUserMenu(false); await supabase.auth.signOut(); };

  const handleCancelSubscription = async () => {
    if (!userEmail) return;
    setCancelling(true);
    try {
      const res  = await fetch(`${API_URL}/api/stripe/cancel-subscription`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_email: userEmail }) });
      const data = await res.json();
      if (data.success) {
        if (data.cancel_at) { await supabase.auth.updateUser({ data: { cancel_at: data.cancel_at } }); setCancelAt(data.cancel_at); }
        setShowConfirm(false); setCancelSuccess(true); setTimeout(() => setCancelSuccess(false), 3000);
      }
    } catch { } finally { setCancelling(false); }
  };

  const surface      = isDarkMode ? 'bg-[#2a2a2d]' : 'bg-[#f0f0f0]';
  const surfaceHover = isDarkMode ? 'hover:bg-[#3a3a3d]' : 'hover:bg-[#e8e8e8]';
  const textPrimary  = isDarkMode ? 'text-white' : 'text-[#1a1a1a]';
  const textSecondary = isDarkMode ? 'text-[#a8a8ad]' : 'text-[#555555]';
  const menuBg  = isDarkMode ? 'bg-[#2a2a2d] border-[#3a3a3d]' : 'bg-white border-[#e0e0e0]';
  const divider = isDarkMode ? 'border-[#3a3a3d]' : 'border-[#e8e8e8]';

  const isCancelling      = isPremium && daysRemaining !== null && daysRemaining > 0;
  const isActiveSubscriber = isPremium && !isCancelling;

  const premiumLabel = daysRemaining !== null && daysRemaining > 0
    ? `Premium — ${daysRemaining}${tr('daysRemaining')}`
    : tr('premiumActive');

  const premiumButtonClass = isActiveSubscriber
    ? isDarkMode ? 'bg-[#2a2a2d] text-yellow-400 border border-yellow-500/30' : 'bg-amber-500 hover:bg-amber-600 text-white border border-amber-600 font-semibold shadow-sm'
    : isCancelling
      ? isDarkMode ? 'bg-[#2a2a2d] text-orange-400 border border-orange-500/30' : 'bg-orange-500 hover:bg-orange-600 text-white border border-orange-600 font-semibold shadow-sm'
      : isDarkMode ? 'bg-[#2a2a2d] hover:bg-[#3a3a3d] text-white' : 'bg-[#f0f0f0] hover:bg-[#e8e8e8] text-[#1a1a1a] border border-[#e0e0e0]';

  const currentLangObj = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <header className={`border-b ${isDarkMode ? 'border-[#2a2a2d] bg-[#1c1c1e]' : 'border-[#e0e0e0] bg-white'} sticky top-0 z-20`}>
      <div className="px-4 py-3 flex items-center justify-between">

        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar} className={`p-2 rounded-lg transition ${surfaceHover}`}>
            <Menu size={20} className={textSecondary} />
          </button>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${surface}`}>
            <Activity size={20} className={textSecondary} />
          </div>
          <h1 className={`text-lg font-semibold ${textPrimary}`}>HippocrateIA</h1>
        </div>

        <div className="flex items-center gap-2">
          {!isPremium && (
            <div className={`text-sm ${textSecondary}`}>{remainingPrompts} {tr('prompts_remaining')}</div>
          )}

          {/* Toggle dark mode */}
          <button onClick={onToggleDarkMode} className={`p-2 rounded-lg transition ${surfaceHover}`} title={isDarkMode ? tr('lightMode') : tr('darkMode')}>
            {isDarkMode ? <Sun size={20} className={textSecondary} /> : <Moon size={20} className="text-[#555555]" />}
          </button>

          {/* Sélecteur de langue UI */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg transition text-sm border ${
                isDarkMode
                  ? 'bg-[#2a2a2d] hover:bg-[#3a3a3d] border-[#3a3a3d] text-white'
                  : 'bg-white hover:bg-[#fafafa] border-[#e0e0e0] text-[#1a1a1a] shadow-sm'
              }`}
              title={tr('languageResponse')}
            >
              <span>{currentLangObj.flag}</span>
              <ChevronDown size={12} className={textSecondary} />
            </button>

            {showLangMenu && (
              <div className={`absolute right-0 top-full mt-2 rounded-xl border shadow-lg overflow-hidden z-30 ${menuBg}`}>
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code as Lang); setShowLangMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition ${
                      lang === l.code
                        ? isDarkMode ? 'bg-[#3a3a3d] text-white' : 'bg-[#f0f0f0] text-[#1a1a1a]'
                        : isDarkMode ? 'text-[#a8a8ad] hover:bg-[#3a3a3d] hover:text-white' : 'text-[#555555] hover:bg-[#f5f5f5]'
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bouton Premium */}
          <div className="relative" ref={planMenuRef}>
            <button
              onClick={() => isPremium ? setShowPlanMenu(!showPlanMenu) : onUpgradeClick()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${premiumButtonClass}`}
            >
              <Crown size={16} />
              {isPremium ? premiumLabel : tr('premium')}
              {isPremium && <ChevronDown size={14} />}
            </button>

            {showPlanMenu && isPremium && (
              <div className={`absolute right-0 top-full mt-2 w-80 rounded-2xl border shadow-xl z-30 overflow-hidden ${menuBg}`}>
                <div className={`p-4 border-b ${divider}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${textSecondary}`}>{tr('plansComparison')}</p>

                  <div className={`rounded-xl p-3 mb-2 border ${isDarkMode ? 'border-[#3a3a3d] bg-[#1c1c1e]' : 'border-[#e0e0e0] bg-[#f8f8f8]'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield size={14} className={textSecondary} />
                      <span className={`text-sm font-medium ${textPrimary}`}>{tr('free')}</span>
                    </div>
                    <ul className={`text-xs space-y-1 ${textSecondary}`}>
                      <li>{tr('freeFeature1')}</li>
                      <li>{tr('freeFeature2')}</li>
                      <li>{tr('freeFeature3')}</li>
                    </ul>
                  </div>

                  <div className={`rounded-xl p-3 border ${
                    isCancelling
                      ? isDarkMode ? 'border-orange-500/40 bg-orange-500/10' : 'border-orange-400 bg-orange-100'
                      : isDarkMode ? 'border-amber-500/40 bg-amber-500/10' : 'border-amber-400 bg-amber-100'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Crown size={14} className={isCancelling ? isDarkMode ? 'text-orange-400' : 'text-orange-600' : isDarkMode ? 'text-amber-400' : 'text-amber-600'} />
                      <span className={`text-sm font-semibold ${isCancelling ? isDarkMode ? 'text-orange-400' : 'text-orange-700' : isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                        Premium — 9,99€/mois{' '}
                        {isCancelling ? `⏳ ${daysRemaining}${tr('daysRemaining')}` : '✓ Actif'}
                      </span>
                    </div>
                    <ul className={`text-xs space-y-1 ${isDarkMode ? 'text-[#a8a8ad]' : 'text-[#555555]'}`}>
                      <li>{tr('premiumFeature1')}</li>
                      <li>{tr('premiumFeature2')}</li>
                      <li>{tr('premiumFeature3')}</li>
                      <li>{tr('premiumFeature4')}</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  {cancelSuccess && <p className="text-xs text-center text-green-500 font-medium">{tr('cancelSuccess')}</p>}

                  {isCancelling ? (
                    <button onClick={() => { setShowPlanMenu(false); onUpgradeClick(); }} className={`w-full py-2 rounded-lg text-sm font-medium transition ${isDarkMode ? 'text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/10' : 'text-amber-700 border border-amber-400 hover:bg-amber-50'}`}>
                      {tr('resubscribe')}
                    </button>
                  ) : showConfirm ? (
                    <div className="space-y-2">
                      <p className={`text-xs text-center ${textSecondary}`}>{tr('cancelConfirmText')}</p>
                      <div className="flex gap-2">
                        <button onClick={() => setShowConfirm(false)} className={`flex-1 py-2 rounded-lg text-sm transition ${surface} ${surfaceHover} ${textSecondary}`}>{tr('back')}</button>
                        <button onClick={handleCancelSubscription} disabled={cancelling} className={`flex-1 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 ${isDarkMode ? 'text-red-400 border border-red-500/20 hover:bg-red-500/10' : 'text-red-600 border border-red-400 hover:bg-red-50'}`}>
                          {cancelling ? tr('inProgress') : tr('confirm')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowConfirm(true)} className={`w-full py-2 rounded-lg text-sm font-medium transition ${isDarkMode ? 'text-red-400 border border-red-500/20 hover:bg-red-500/10' : 'text-red-600 border border-red-400 hover:bg-red-50'}`}>
                      {tr('cancelSubscription')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bouton compte / connexion */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition border ${isDarkMode ? 'bg-[#2a2a2d] hover:bg-[#3a3a3d] border-[#3a3a3d] text-white' : 'bg-white hover:bg-[#fafafa] border-[#e0e0e0] text-[#1a1a1a] shadow-sm'}`}
              >
                <AvatarSvg id={userAvatarId} size={24} />
                <span className="text-sm max-w-[100px] truncate">{userFullName || userEmail}</span>
                <ChevronDown size={14} className={textSecondary} />
              </button>

              {showUserMenu && (
                <div className={`absolute right-0 top-full mt-2 w-64 rounded-2xl border shadow-xl z-30 overflow-hidden ${menuBg}`}>
                  <div className={`p-4 border-b ${divider}`}>
                    <div className="flex items-center gap-3">
                      <AvatarSvg id={userAvatarId} size={44} />
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${textPrimary}`}>{userFullName || 'Utilisateur'}</p>
                        <p className={`text-xs truncate ${textSecondary}`}>{userEmail}</p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 border-b ${divider}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${textSecondary}`}>{tr('subscription')}</p>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isActiveSubscriber ? isDarkMode ? 'bg-amber-500/10' : 'bg-amber-100' : isCancelling ? isDarkMode ? 'bg-orange-500/10' : 'bg-orange-100' : isDarkMode ? 'bg-[#1c1c1e]' : 'bg-[#f8f8f8]'}`}>
                      {isPremium
                        ? <Crown size={14} className={isCancelling ? isDarkMode ? 'text-orange-400' : 'text-orange-600' : isDarkMode ? 'text-amber-400' : 'text-amber-600'} />
                        : <Shield size={14} className={textSecondary} />
                      }
                      <div>
                        <p className={`text-sm font-semibold ${isActiveSubscriber ? isDarkMode ? 'text-amber-400' : 'text-amber-700' : isCancelling ? isDarkMode ? 'text-orange-400' : 'text-orange-700' : textPrimary}`}>
                          {isPremium ? tr('premium') : tr('free')}
                        </p>
                        <p className={`text-xs ${textSecondary}`}>
                          {isPremium
                            ? isCancelling
                              ? `${tr('cancelled')} — ${daysRemaining} ${daysRemaining! > 1 ? tr('days') : tr('day')}`
                              : tr('premiumMonthly')
                            : tr('free_desc')
                          }
                        </p>
                      </div>
                    </div>
                    {!isPremium && (
                      <button onClick={() => { setShowUserMenu(false); onUpgradeClick(); }} className={`w-full mt-2 py-1.5 rounded-lg text-xs font-medium transition ${isDarkMode ? 'text-amber-400 border border-amber-500/20 hover:bg-amber-500/10' : 'text-amber-700 border border-amber-400 hover:bg-amber-100'}`}>
                        {tr('upgradeToPremium')}
                      </button>
                    )}
                    {isCancelling && (
                      <button onClick={() => { setShowUserMenu(false); onUpgradeClick(); }} className={`w-full mt-2 py-1.5 rounded-lg text-xs font-medium transition ${isDarkMode ? 'text-amber-400 border border-amber-500/20 hover:bg-amber-500/10' : 'text-amber-700 border border-amber-400 hover:bg-amber-100'}`}>
                        {tr('resubscribe')}
                      </button>
                    )}
                  </div>

                  <div className="p-2">
                    {userEmail === ADMIN_EMAIL && (
                      <button onClick={() => { setShowUserMenu(false); navigate('/admin'); }} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${surfaceHover} ${textSecondary}`}>
                        <Settings size={14} />{tr('administration')}
                      </button>
                    )}
                    <button onClick={() => { setShowUserMenu(false); navigate('/profile'); }} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${surfaceHover} ${textSecondary}`}>
                      <User size={14} />{tr('myProfile')}
                    </button>
                    <button onClick={handleLogout} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${surfaceHover} ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                      <LogOut size={14} />{tr('logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={onAuthClick} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition border ${isDarkMode ? 'bg-[#2a2a2d] hover:bg-[#3a3a3d] border-[#3a3a3d] text-white' : 'bg-white hover:bg-[#fafafa] border-[#e0e0e0] text-[#1a1a1a] shadow-sm'}`}>
              <User size={16} />{tr('login')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}