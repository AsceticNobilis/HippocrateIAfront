import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Check, Lock, User, Loader2 } from 'lucide-react';
import { AVATARS, getAvatar } from '../lib/avatars';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('capybara');
  const [userEmail, setUserEmail] = useState('');
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  const isDarkMode = document.documentElement.classList.contains('dark');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate('/'); return; }
      setName(user.user_metadata?.name || user.user_metadata?.full_name || '');
      setSelectedAvatar(user.user_metadata?.avatar_id || 'capybara');
      setUserEmail(user.email || '');
      setIsGoogleUser(user.app_metadata?.provider === 'google');
      setLoading(false);
    });
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSavedMsg('');
    const { error } = await supabase.auth.updateUser({
      data: { name, avatar_id: selectedAvatar }
    });
    if (!error) {
      await supabase.auth.refreshSession();
      setSavedMsg('✓ Profil mis à jour');
      setTimeout(() => setSavedMsg(''), 3000);
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (newPassword !== confirmPassword) { setPasswordError('Les mots de passe ne correspondent pas'); return; }
    if (newPassword.length < 6) { setPasswordError('Minimum 6 caractères'); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { setPasswordError(error.message); }
    else {
      setNewPassword(''); setConfirmPassword('');
      setSavedMsg('✓ Mot de passe mis à jour');
      setTimeout(() => setSavedMsg(''), 3000);
    }
    setSaving(false);
  };

  const currentAvatar = getAvatar(selectedAvatar);

  const bg = isDarkMode ? 'bg-[#1c1c1e]' : 'bg-white';
  const card = isDarkMode ? 'bg-[#2a2a2d]' : 'bg-white';
  const border = isDarkMode ? 'border-[#3a3a3d]' : 'border-[#e0e0e0]';
  const textPrimary = isDarkMode ? 'text-white' : 'text-[#1a1a1a]';
  const textSecondary = isDarkMode ? 'text-[#a8a8ad]' : 'text-[#555555]';
  const inputBg = isDarkMode
    ? 'bg-[#1c1c1e] border-[#3a3a3d] text-white placeholder:text-[#5a5a5f] focus:border-[#5a5a5f]'
    : 'bg-[#f8f8f8] border-[#e0e0e0] text-[#1a1a1a] placeholder:text-[#aaaaaa] focus:border-[#c0c0c0]';

  if (loading) return (
    <div className={`min-h-screen ${bg} flex items-center justify-center`}>
      <Loader2 size={32} className="animate-spin text-[#a8a8ad]" />
    </div>
  );

  return (
    <div className={`min-h-screen ${bg} ${textPrimary}`}>
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className={`p-2 rounded-lg transition ${isDarkMode ? 'hover:bg-[#2a2a2d]' : 'hover:bg-[#f0f0f0]'}`}
          >
            <ArrowLeft size={20} className={textSecondary} />
          </button>
          <h1 className="text-xl font-semibold">Mon profil</h1>
          {savedMsg && (
            <span className="ml-auto text-sm text-green-500 flex items-center gap-1">
              <Check size={14} /> {savedMsg}
            </span>
          )}
        </div>

        {/* Avatar */}
        <div className={`${card} rounded-2xl p-6 mb-4 border ${border} ${!isDarkMode ? 'shadow-sm' : ''}`}>
          <div className="flex items-center gap-5 mb-6">
            <div
              className={`w-20 h-20 rounded-full overflow-hidden flex-shrink-0 ring-4 ${isDarkMode ? 'ring-[#3a3a3d]' : 'ring-[#e0e0e0]'}`}
              dangerouslySetInnerHTML={{ __html: currentAvatar.svg }}
            />
            <div>
              <p className="text-lg font-semibold">{name || 'Utilisateur'}</p>
              <p className={`text-sm ${textSecondary}`}>{userEmail}</p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-[#6e6e73]' : 'text-[#aaaaaa]'}`}>{currentAvatar.name}</p>
            </div>
          </div>

          <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${textSecondary}`}>
            Choisir un avatar
          </p>
          <div className="grid grid-cols-4 gap-3">
            {AVATARS.map((av) => (
              <button
                key={av.id}
                onClick={() => setSelectedAvatar(av.id)}
                className={`group relative flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                  selectedAvatar === av.id
                    ? isDarkMode
                      ? 'bg-[#3a3a3d] ring-2 ring-white/20 scale-105'
                      : 'bg-[#f0f0f0] ring-2 ring-[#c0c0c0] scale-105'
                    : isDarkMode
                      ? 'hover:bg-[#333335] opacity-70 hover:opacity-100'
                      : 'hover:bg-[#f5f5f5] opacity-70 hover:opacity-100'
                }`}
                title={av.name}
              >
                <div
                  className="w-14 h-14 rounded-full overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: av.svg }}
                />
                <span className={`text-xs transition-colors ${isDarkMode ? 'text-[#a8a8ad] group-hover:text-white' : 'text-[#555555] group-hover:text-[#1a1a1a]'}`}>
                  {av.name}
                </span>
                {selectedAvatar === av.id && (
                  <div className={`absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white' : 'bg-[#1a1a1a]'}`}>
                    <Check size={10} className={isDarkMode ? 'text-black' : 'text-white'} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pseudo */}
        <div className={`${card} rounded-2xl p-6 mb-4 border ${border} ${!isDarkMode ? 'shadow-sm' : ''}`}>
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className={textSecondary} />
            <p className="font-medium">Pseudo</p>
          </div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Votre pseudo"
            className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none mb-4 ${inputBg}`}
          />
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center gap-2 ${
              isDarkMode
                ? 'bg-white text-black hover:bg-gray-100'
                : 'bg-[#1a1a1a] text-white hover:bg-[#333333]'
            }`}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Enregistrer
          </button>
        </div>

        {/* Mot de passe */}
        {!isGoogleUser && (
          <div className={`${card} rounded-2xl p-6 border ${border} ${!isDarkMode ? 'shadow-sm' : ''}`}>
            <div className="flex items-center gap-2 mb-4">
              <Lock size={16} className={textSecondary} />
              <p className="font-medium">Changer le mot de passe</p>
            </div>
            <div className="space-y-3">
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Nouveau mot de passe"
                className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none ${inputBg}`}
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirmer le mot de passe"
                className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none ${inputBg}`}
              />
              {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
              <button
                onClick={handleChangePassword}
                disabled={saving || !newPassword}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center gap-2 ${
                  isDarkMode
                    ? 'bg-white text-black hover:bg-gray-100'
                    : 'bg-[#1a1a1a] text-white hover:bg-[#333333]'
                }`}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                Mettre à jour
              </button>
            </div>
          </div>
        )}

        {isGoogleUser && (
          <div className={`${card} rounded-2xl p-6 border ${border} ${!isDarkMode ? 'shadow-sm' : ''}`}>
            <p className={`text-sm ${textSecondary}`}>
              Connecté via Google — le mot de passe est géré par votre compte Google.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}