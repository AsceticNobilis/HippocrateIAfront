import { Send, Paperclip, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../lib/useTranslation';

interface ChatInputProps {
  onSendMessage: (message: string, file?: File, lang?: string) => void;
  disabled?: boolean;
  isDarkMode: boolean;
  remainingPrompts?: number;
  isPremium?: boolean;
  initialMessage?: string;
}

export default function ChatInput({ onSendMessage, disabled, isDarkMode, initialMessage = '' }: ChatInputProps) {
  const { tr, lang } = useTranslation();
  const [message, setMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(initialMessage.length, initialMessage.length);
        }
      }, 50);
    }
  }, [initialMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || attachedFile) && !disabled) {
      onSendMessage(message, attachedFile || undefined, lang);
      setMessage('');
      setAttachedFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert(tr('fileTooLarge')); return; }
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/png',
      'image/jpeg',
      'image/jpg',
    ];
    if (!validTypes.includes(file.type)) { alert(tr('fileUnsupported')); return; }
    setAttachedFile(file);
  };

  const removeFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`border-t ${isDarkMode ? 'border-[#2a2a2d] bg-[#1c1c1e]' : 'border-[#e0e0e0] bg-white'} p-4`}>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">

        {attachedFile && (
          <div className={`mb-2 p-3 rounded-lg flex items-center justify-between border ${
            isDarkMode ? 'bg-[#2a2a2d] border-transparent' : 'bg-[#f8f8f8] border-[#e0e0e0]'
          }`}>
            <div className="flex items-center gap-2">
              <Paperclip size={16} className={isDarkMode ? 'text-[#a8a8ad]' : 'text-[#555555]'} />
              <span className={`text-sm ${isDarkMode ? 'text-[#e8e8ed]' : 'text-[#1a1a1a]'}`}>{attachedFile.name}</span>
              <span className={`text-xs ${isDarkMode ? 'text-[#6e6e73]' : 'text-[#777777]'}`}>
                ({(attachedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className={`p-1 rounded ${isDarkMode ? 'hover:bg-[#3a3a3d]' : 'hover:bg-[#e8e8e8]'}`}
            >
              <X size={16} className={isDarkMode ? 'text-[#a8a8ad]' : 'text-[#555555]'} />
            </button>
          </div>
        )}

        <div className={`flex gap-3 items-end rounded-2xl p-3 border ${
          isDarkMode ? 'bg-[#2a2a2d] border-transparent' : 'bg-[#f8f8f8] border-[#e0e0e0]'
        }`}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className={`p-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
              isDarkMode ? 'hover:bg-[#3a3a3d] text-[#a8a8ad]' : 'hover:bg-[#eeeeee] text-[#555555]'
            }`}
            title={tr('attachFile')}
          >
            <Paperclip size={20} />
          </button>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={tr('placeholder')}
            rows={1}
            disabled={disabled}
            className={`flex-1 bg-transparent border-none outline-none resize-none max-h-32 ${
              isDarkMode ? 'text-white placeholder-[#6e6e73]' : 'text-[#1a1a1a] placeholder-[#aaaaaa]'
            }`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />

          <button
            type="submit"
            disabled={(!message.trim() && !attachedFile) || disabled}
            className={`p-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
              isDarkMode
                ? 'bg-[#3a3a3d] hover:bg-[#4a4a4d] text-white disabled:hover:bg-[#3a3a3d]'
                : 'bg-[#1a1a1a] hover:bg-[#333333] text-white disabled:hover:bg-[#1a1a1a]'
            }`}
          >
            <Send size={18} />
          </button>
        </div>

        <p className={`text-xs text-center mt-2 ${isDarkMode ? 'text-[#6e6e73]' : 'text-[#aaaaaa]'}`}>
          {tr('disclaimer')}
        </p>
      </form>
    </div>
  );
}