import { useState, useEffect, useRef } from 'react';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import PremiumModal from './components/PremiumModal';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import AdBanner from './components/AdBanner';
import QCMGenerator from './components/QCMGenerator';
import { supabase } from './lib/supabase';

interface User {
  id: string;
  email?: string;
  [key: string]: any;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  file?: { name: string; type: string; };
}

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
}

function readIsPremium(user: any): boolean {
  return user?.user_metadata?.is_premium === true;
}

function readAvatarId(user: any): string {
  return user?.user_metadata?.avatar_id || 'capybara';
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [remainingPrompts, setRemainingPrompts] = useState(10);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showQCMModal, setShowQCMModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? saved === 'true' : true;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userAvatarId, setUserAvatarId] = useState('capybara');
  const [pendingMessage, setPendingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsPremium(readIsPremium(session?.user));
      setUserAvatarId(readAvatarId(session?.user));
      if (session?.user) loadConversations(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsPremium(readIsPremium(session?.user));
      setUserAvatarId(readAvatarId(session?.user));

      if (session?.user) {
        loadConversations(session.user.id);
      } else {
        setConversations([]);
        setCurrentConversationId(null);
        setMessages([]);
      }

      if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        supabase.auth.getUser().then(({ data: { user: freshUser } }) => {
          if (freshUser) {
            setUser(freshUser);
            setIsPremium(readIsPremium(freshUser));
            setUserAvatarId(readAvatarId(freshUser));
          }
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async (userId: string) => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) { console.error('Erreur chargement conversations:', error); return; }

    const convs: Conversation[] = (data || []).map((c: any) => ({
      id: c.id,
      title: c.title,
      timestamp: new Date(c.created_at),
    }));
    setConversations(convs);

    if (convs.length > 0) {
      setCurrentConversationId(convs[0].id);
      loadMessages(convs[0].id);
    }
  };

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) { console.error('Erreur chargement messages:', error); return; }

    setMessages((data || []).map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })));
  };

  const createConversation = async (firstMessage: string): Promise<string | null> => {
    if (!user) return null;
    const title = firstMessage.slice(0, 40) + (firstMessage.length > 40 ? '...' : '');
    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, title })
      .select()
      .single();

    if (error) { console.error('Erreur création conversation:', error); return null; }

    const newConv: Conversation = {
      id: data.id,
      title: data.title,
      timestamp: new Date(data.created_at),
    };
    setConversations(prev => [newConv, ...prev]);
    setCurrentConversationId(data.id);
    return data.id;
  };

  const saveMessage = async (conversationId: string, role: 'user' | 'assistant', content: string) => {
    const { error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, role, content });
    if (error) console.error('Erreur sauvegarde message:', error);
  };

  const handleSendMessage = async (content: string, file?: File, lang?: string ) => {
    if (!isPremium && remainingPrompts <= 0) {
      setShowPremiumModal(true);
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: content || (file ? `📎 ${file.name}` : ''),
      file: file ? { name: file.name, type: file.type } : undefined,
    };

    const historySnapshot = messages.map(m => ({ role: m.role, content: m.content }));

    setMessages(prev => [...prev, userMessage]);
    setPendingMessage('');
    setIsLoading(true);

    let convId = currentConversationId;
    if (user && !convId) {
      convId = await createConversation(userMessage.content);
    }

    if (user && convId) {
      await saveMessage(convId, 'user', userMessage.content);
    }

    try {
      let data: any;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('question', content);
        const response = await fetch(`${API_URL}/api/query-with-file`, { method: 'POST', body: formData });
        data = await response.json();
      } else {
         const response = await fetch(`${API_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: content, history: historySnapshot, ui_lang: lang || 'fr' }),
  });
        data = await response.json();
      }

      const assistantContent = data.success
        ? data.response
        : `❌ Erreur backend : ${data.error || 'Réponse invalide du serveur.'}`;

      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);

      if (user && convId) {
        await saveMessage(convId, 'assistant', assistantContent);
      }

      if (!isPremium) {
        setRemainingPrompts(prev => Math.max(0, prev - 1));
      }

    } catch {
      const errorMsg = `❌ Échec de connexion au serveur. Vérifiez que le backend est bien lancé sur ${API_URL}`;
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
      if (user && currentConversationId) await saveMessage(currentConversationId, 'assistant', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessageWithHistory = async (content: string, history: Message[], lang?: string) => {
    if (!isPremium && remainingPrompts <= 0) {
      setShowPremiumModal(true);
      return;
    }

    const userMessage: Message = { role: 'user', content };
    const historySnapshot = history.map(m => ({ role: m.role, content: m.content }));

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    let convId = currentConversationId;
    if (user && convId) await saveMessage(convId, 'user', content);

    try {
      const response = await fetch(`${API_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: content, history: historySnapshot, ui_lang: lang || 'fr' }),
  });
      const data = await response.json();

      const assistantContent = data.success
        ? data.response
        : `❌ Erreur backend : ${data.error || 'Réponse invalide du serveur.'}`;

      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);

      if (user && convId) await saveMessage(convId, 'assistant', assistantContent);
      if (!isPremium) setRemainingPrompts(prev => Math.max(0, prev - 1));

    } catch {
      const errorMsg = '❌ Échec de connexion au serveur.';
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
      if (user && currentConversationId) await saveMessage(currentConversationId, 'assistant', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = (content: string) => {
  const lang = localStorage.getItem('uiLang') || 'fr';
  setMessages(prev => {
    const reversed = [...prev].reverse();
    const lastUserIndex = reversed.findIndex(m => m.role === 'user' && m.content === content);
    if (lastUserIndex === -1) return prev;
    const realIndex = prev.length - 1 - lastUserIndex;
    const trimmed = prev.slice(0, realIndex);
    setTimeout(() => handleSendMessageWithHistory(content, trimmed, lang), 0);
    return trimmed;
  });
};

  const handleEdit = (content: string) => {
    setIsLoading(false);
    setPendingMessage(content);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleNewConversation = () => {
    setIsLoading(false);
    setCurrentConversationId(null);
    setMessages([]);
    setPendingMessage('');
  };

  const handleSelectConversation = (id: string) => {
    setIsLoading(false);
    setCurrentConversationId(id);
    loadMessages(id);
    setPendingMessage('');
  };

  const handleDeleteConversation = async (id: string) => {
    if (user) {
      const { error } = await supabase.from('conversations').delete().eq('id', id);
      if (error) { console.error('Erreur suppression:', error); return; }
    }

    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);

    if (currentConversationId === id) {
      if (updated.length > 0) {
        setCurrentConversationId(updated[0].id);
        loadMessages(updated[0].id);
      } else {
        handleNewConversation();
      }
    }
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-[#1c1c1e] text-white' : 'bg-white text-[#1a1a1a]'} overflow-hidden`}>
      <Sidebar
        isOpen={sidebarOpen}
        conversations={conversations}
        currentConversationId={currentConversationId || ''}
        onNewConversation={handleNewConversation}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        isDarkMode={isDarkMode}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          isPremium={isPremium}
          remainingPrompts={remainingPrompts}
          onUpgradeClick={() => setShowPremiumModal(true)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onAuthClick={() => setShowAuthModal(true)}
          isAuthenticated={!!user}
          userEmail={user?.email}
          userFullName={user?.user_metadata?.name || user?.user_metadata?.full_name}
          userAvatarId={userAvatarId}
        />

        {!isPremium && <AdBanner isDarkMode={isDarkMode} />}

        <main className="flex-1 overflow-y-auto">
          <div className="h-full w-full">
            {messages.length === 0 ? (
              <WelcomeScreen
                onSuggestionClick={handleSendMessage}
                onQCMClick={() => setShowQCMModal(true)}
                isDarkMode={isDarkMode}
              />
            ) : (
              <div className="pb-4">
                {messages.map((message, index) => {
  // Trouve la question associée à chaque réponse IA
  const question = message.role === 'assistant' && index > 0
    ? messages[index - 1]?.content
    : undefined;

  return (
    <ChatMessage
      key={`${currentConversationId}-${index}`}
      role={message.role}
      content={message.content}
      isDarkMode={isDarkMode}
      onResend={handleResend}
      onEdit={handleEdit}
      question={question}
      conversationId={currentConversationId}
    />
  );
})}
                {isLoading && (
                  <div className={`py-6 px-4 ${isDarkMode ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
                    <div className="max-w-4xl mx-auto flex gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                        isDarkMode ? 'bg-[#2a2a2d]' : 'bg-[#f5f5f5] border border-[#e8e8e8]'
                      }`}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isDarkMode ? 'text-[#a8a8ad]' : 'text-[#555555]'}>
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-[#a8a8ad]' : 'bg-[#555555]'}`} style={{ animationDelay: '0ms' }} />
                        <span className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-[#a8a8ad]' : 'bg-[#555555]'}`} style={{ animationDelay: '150ms' }} />
                        <span className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-[#a8a8ad]' : 'bg-[#555555]'}`} style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </main>

        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          isDarkMode={isDarkMode}
          remainingPrompts={remainingPrompts}
          isPremium={isPremium}
          initialMessage={pendingMessage}
        />

        <Footer isDarkMode={isDarkMode} />
      </div>

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        isDarkMode={isDarkMode}
        userEmail={user?.email}
        apiUrl={API_URL}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        isDarkMode={isDarkMode}
      />

      {showQCMModal && (
        <QCMGenerator
          isDarkMode={isDarkMode}
          onClose={() => setShowQCMModal(false)}
          apiUrl={API_URL}
        />
      )}
    </div>
  );
}

export default App;