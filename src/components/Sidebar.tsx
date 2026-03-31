import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { useTranslation } from '../lib/useTranslation';

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
}

interface SidebarProps {
  isOpen: boolean;
  conversations: Conversation[];
  currentConversationId: string;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  isDarkMode: boolean;
}

export default function Sidebar({ isOpen, conversations, currentConversationId, onNewConversation, onSelectConversation, onDeleteConversation, isDarkMode }: SidebarProps) {
  const { tr } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className={`w-64 flex flex-col ${isDarkMode ? 'bg-[#1c1c1e] border-r border-[#2a2a2d]' : 'bg-white border-r border-[#e0e0e0]'}`}>
      <div className="p-3">
        <button
          onClick={onNewConversation}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition border ${
            isDarkMode
              ? 'bg-[#2a2a2d] hover:bg-[#3a3a3d] border-transparent text-white'
              : 'bg-white hover:bg-[#fafafa] border-[#e0e0e0] text-[#1a1a1a]'
          }`}
        >
          <Plus size={18} />
          <span>{tr('newConversation')}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group relative flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition ${
                currentConversationId === conv.id
                  ? isDarkMode ? 'bg-[#2a2a2d] text-white' : 'bg-[#f0f0f0] text-[#1a1a1a]'
                  : isDarkMode ? 'text-[#a8a8ad] hover:bg-[#2a2a2d]/50 hover:text-white' : 'text-[#555555] hover:bg-[#f0f0f0] hover:text-[#1a1a1a]'
              }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <MessageSquare size={16} className="flex-shrink-0" />
              <span className="flex-1 text-sm truncate">{conv.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteConversation(conv.id); }}
                className={`opacity-0 group-hover:opacity-100 p-1 rounded transition ${isDarkMode ? 'hover:bg-[#3a3a3d]' : 'hover:bg-[#e8e8e8]'}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}