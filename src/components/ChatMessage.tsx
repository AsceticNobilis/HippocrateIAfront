import { useState } from 'react';
import { Activity, User, Copy, Check, RotateCcw, Pencil, ThumbsUp, ThumbsDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from '../lib/useTranslation';
import { supabase } from '../lib/supabase';
import FeedbackModal from './FeedbackModal';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isDarkMode: boolean;
  onResend?: (content: string) => void;
  onEdit?: (content: string) => void;
  question?: string;
  conversationId?: string | null;
}

export default function ChatMessage({ role, content, isDarkMode, onResend, onEdit, question, conversationId }: ChatMessageProps) {
  const { tr } = useTranslation();
  const isAssistant = role === 'assistant';
  const [copied, setCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveFeedback = async (isPositive: boolean, extra?: { correction?: string; reason?: string; category?: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('feedbacks').insert({
      user_id: user?.id ?? null,
      conversation_id: conversationId ?? null,
      question: question ?? '',
      ia_response: content,
      is_positive: isPositive,
      correction: extra?.correction ?? null,
      reason: extra?.reason ?? null,
      category: extra?.category ?? null,
    });
  };

  const handleLike = async () => {
    if (liked !== null) return;
    setLiked(true);
    await saveFeedback(true);
  };

  const handleDislike = () => {
    if (liked !== null) return;
    setLiked(false);
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = async (data: { correction?: string; reason?: string; category?: string }) => {
    await saveFeedback(false, data);
  };

  const surface      = isDarkMode ? 'bg-[#2a2a2d]' : 'bg-[#f0f0f0]';
  const surfaceHover = isDarkMode ? 'hover:bg-[#3a3a3d]' : 'hover:bg-[#e8e8e8]';
  const textSecondary = isDarkMode ? 'text-[#a8a8ad]' : 'text-[#555555]';

  return (
    <>
      <div
        className={`py-6 px-4 group ${isAssistant ? (isDarkMode ? 'bg-[#1c1c1e]' : 'bg-white') : ''}`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="max-w-4xl mx-auto flex gap-4">
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-[#2a2a2d]' : 'bg-[#f0f0f0]'}`}>
            {isAssistant
              ? <Activity size={18} className={isDarkMode ? 'text-[#a8a8ad]' : 'text-[#555555]'} />
              : <User size={18} className={isDarkMode ? 'text-[#a8a8ad]' : 'text-[#555555]'} />
            }
          </div>

          <div className="flex-1 min-w-0">
            {isAssistant ? (
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className={`mb-3 last:mb-0 leading-relaxed ${isDarkMode ? 'text-[#e8e8ed]' : 'text-[#1a1a1a]'}`}>{children}</p>,
                  h1: ({ children }) => <h1 className={`text-xl font-bold mb-3 mt-4 first:mt-0 ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>{children}</h1>,
                  h2: ({ children }) => <h2 className={`text-lg font-semibold mb-2 mt-4 first:mt-0 ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>{children}</h2>,
                  h3: ({ children }) => <h3 className={`text-base font-semibold mb-2 mt-3 first:mt-0 ${isDarkMode ? 'text-[#e8e8ed]' : 'text-[#1a1a1a]'}`}>{children}</h3>,
                  ul: ({ children }) => <ul className={`mb-3 space-y-1 pl-4 ${isDarkMode ? 'text-[#e8e8ed]' : 'text-[#1a1a1a]'}`}>{children}</ul>,
                  ol: ({ children }) => <ol className={`mb-3 space-y-1 pl-4 list-decimal ${isDarkMode ? 'text-[#e8e8ed]' : 'text-[#1a1a1a]'}`}>{children}</ol>,
                  li: ({ children }) => (
                    <li className="flex items-start gap-2">
                      <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${isDarkMode ? 'bg-[#5a5a5f]' : 'bg-[#aaaaaa]'}`} />
                      <span>{children}</span>
                    </li>
                  ),
                  strong: ({ children }) => <strong className={`font-semibold ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>{children}</strong>,
                  em: ({ children }) => <em className={`italic ${isDarkMode ? 'text-[#c8c8cd]' : 'text-[#444444]'}`}>{children}</em>,
                  hr: () => <hr className={`my-4 border-t ${isDarkMode ? 'border-[#3a3a3d]' : 'border-[#e0e0e0]'}`} />,
                  code: ({ children }) => <code className={`px-1.5 py-0.5 rounded text-sm font-mono ${isDarkMode ? 'bg-[#3a3a3d] text-[#e8e8ed]' : 'bg-[#f0f0f0] text-[#1a1a1a]'}`}>{children}</code>,
                  pre: ({ children }) => <pre className={`p-4 rounded-xl mb-3 overflow-x-auto text-sm font-mono ${isDarkMode ? 'bg-[#2a2a2d] text-[#e8e8ed]' : 'bg-[#f0f0f0] text-[#1a1a1a]'}`}>{children}</pre>,
                  blockquote: ({ children }) => <blockquote className={`border-l-4 pl-4 my-3 ${isDarkMode ? 'border-yellow-500/50 text-[#a8a8ad]' : 'border-yellow-400 text-[#555555]'}`}>{children}</blockquote>,
                }}
              >
                {content}
              </ReactMarkdown>
            ) : (
              <p className={`whitespace-pre-wrap leading-relaxed ${isDarkMode ? 'text-[#e8e8ed]' : 'text-[#1a1a1a]'}`}>{content}</p>
            )}

            {/* Barre d'actions */}
            <div className={`flex items-center gap-1 mt-3 transition-opacity duration-150 ${showActions ? 'opacity-100' : 'opacity-0'}`}>

              {/* Copier */}
              <button
                onClick={handleCopy}
                title={copied ? tr('copied') : tr('copy')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition ${surface} ${surfaceHover} ${textSecondary}`}
              >
                {copied
                  ? <><Check size={13} className="text-green-500" /><span className="text-green-500">{tr('copied')}</span></>
                  : <><Copy size={13} /><span>{tr('copy')}</span></>
                }
              </button>

              {/* Relancer — messages utilisateur uniquement */}
              {!isAssistant && onResend && (
                <button
                  onClick={() => onResend(content)}
                  title={tr('resend')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition ${surface} ${surfaceHover} ${textSecondary}`}
                >
                  <RotateCcw size={13} />
                  <span>{tr('resend')}</span>
                </button>
              )}

              {/* Modifier — messages utilisateur uniquement */}
              {!isAssistant && onEdit && (
                <button
                  onClick={() => onEdit(content)}
                  title={tr('edit')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition ${surface} ${surfaceHover} ${textSecondary}`}
                >
                  <Pencil size={13} />
                  <span>{tr('edit')}</span>
                </button>
              )}

              {/* Like / Dislike — messages IA uniquement */}
              {isAssistant && (
                <div className="flex items-center gap-1 ml-1">
                  <button
                    onClick={handleLike}
                    disabled={liked !== null}
                    title={tr('feedbackLike')}
                    className={`p-1.5 rounded-lg text-xs transition disabled:cursor-default ${
                      liked === true
                        ? 'text-green-500'
                        : `${surfaceHover} ${textSecondary} disabled:opacity-50`
                    }`}
                  >
                    <ThumbsUp size={13} />
                  </button>
                  <button
                    onClick={handleDislike}
                    disabled={liked !== null}
                    title={tr('feedbackDislike')}
                    className={`p-1.5 rounded-lg text-xs transition disabled:cursor-default ${
                      liked === false
                        ? 'text-red-500'
                        : `${surfaceHover} ${textSecondary} disabled:opacity-50`
                    }`}
                  >
                    <ThumbsDown size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleFeedbackSubmit}
        isDarkMode={isDarkMode}
      />
    </>
  );
}