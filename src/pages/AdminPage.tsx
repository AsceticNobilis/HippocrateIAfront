import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Upload, FileText, CheckCircle, XCircle, Loader2,
  Database, Trash2, ThumbsDown, ThumbsUp, Download,
  ChevronDown, ChevronUp
} from 'lucide-react';

const ADMIN_EMAIL = 'mopinab@gmail.com';
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

interface IngestResult {
  filename: string;
  chunks_created: number;
  total_characters: number;
  message: string;
  success: boolean;
}

interface Feedback {
  id: string;
  created_at: string;
  user_id: string | null;
  conversation_id: string | null;
  question: string;
  ia_response: string;
  is_positive: boolean;
  correction: string | null;
  reason: string | null;
  category: string | null;
}

type Tab = 'ingest' | 'feedbacks';
type FeedbackFilter = 'all' | 'positive' | 'negative';

const CATEGORY_LABELS: Record<string, string> = {
  inexact: 'Inexact',
  incomplet: 'Incomplet',
  mauvaise_langue: 'Mauvaise langue',
  hors_sujet: 'Hors sujet',
};

export default function AdminPage() {
  const navigate = useNavigate();

  // Auth
  const [loading, setLoading]       = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab]   = useState<Tab>('ingest');

  // Ingest
  const [file, setFile]         = useState<File | null>(null);
  const [source, setSource]     = useState('');
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [ingesting, setIngesting] = useState(false);
  const [results, setResults]   = useState<IngestResult[]>([]);
  const [ingestError, setIngestError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Feedbacks
  const [feedbacks, setFeedbacks]           = useState<Feedback[]>([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);
  const [feedbackFilter, setFeedbackFilter] = useState<FeedbackFilter>('all');
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const [totalLikes, setTotalLikes]         = useState(0);
  const [totalDislikes, setTotalDislikes]   = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || session.user.email !== ADMIN_EMAIL) {
        navigate('/');
      } else {
        setAuthorized(true);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (authorized && activeTab === 'feedbacks') {
      loadFeedbacks();
    }
  }, [authorized, activeTab, feedbackFilter]);

  const loadFeedbacks = async () => {
    setFeedbacksLoading(true);
    try {
      let query = supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false });

      if (feedbackFilter === 'positive')  query = query.eq('is_positive', true);
      if (feedbackFilter === 'negative')  query = query.eq('is_positive', false);

      const { data, error } = await query;
      if (error) throw error;
      setFeedbacks(data || []);

      // Stats globales
      const { count: likes }    = await supabase.from('feedbacks').select('*', { count: 'exact', head: true }).eq('is_positive', true);
      const { count: dislikes } = await supabase.from('feedbacks').select('*', { count: 'exact', head: true }).eq('is_positive', false);
      setTotalLikes(likes ?? 0);
      setTotalDislikes(dislikes ?? 0);
    } catch (err) {
      console.error('Erreur chargement feedbacks:', err);
    } finally {
      setFeedbacksLoading(false);
    }
  };

  const exportCSV = () => {
    const negative = feedbacks.filter(f => !f.is_positive);
    if (negative.length === 0) return;

    const headers = ['date', 'question', 'reponse_ia', 'correction', 'categorie', 'raison'];
    const rows = negative.map(f => [
      new Date(f.created_at).toLocaleDateString('fr-FR'),
      `"${f.question.replace(/"/g, '""')}"`,
      `"${f.ia_response.replace(/"/g, '""')}"`,
      `"${(f.correction || '').replace(/"/g, '""')}"`,
      f.category || '',
      `"${(f.reason || '').replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `feedbacks_negatifs_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Ingest handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setIngestError('');
    if (!source) setSource(f.name.replace(/\.[^.]+$/, ''));
  };

  const handleIngest = async () => {
    if (!file) { setIngestError('Sélectionne un fichier'); return; }
    setIngestError('');
    setIngesting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('source', source || file.name);
      formData.append('language', language);

      const response = await fetch(`${API_URL}/api/ingest`, { method: 'POST', body: formData });
      const data     = await response.json();

      if (!response.ok || !data.success) throw new Error(data.detail || "Erreur lors de l'ingestion");

      setResults(prev => [data, ...prev]);
      setFile(null);
      setSource('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      setIngestError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIngesting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#1c1c1e] flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-[#a8a8ad]" />
    </div>
  );

  if (!authorized) return null;

  const filteredFeedbacks = feedbacks;
  const negativeFeedbacks = feedbacks.filter(f => !f.is_positive);
  const categoryCounts    = negativeFeedbacks.reduce((acc, f) => {
    if (f.category) acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-[#1c1c1e] text-white p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#2a2a2d] flex items-center justify-center">
            <Database size={20} className="text-[#a8a8ad]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Administration</h1>
            <p className="text-sm text-[#a8a8ad]">HippocrateIA — Panneau de contrôle</p>
          </div>
          <button onClick={() => navigate('/')} className="ml-auto text-sm text-[#a8a8ad] hover:text-white transition">
            ← Retour
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-[#2a2a2d] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('ingest')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
              activeTab === 'ingest' ? 'bg-[#3a3a3d] text-white' : 'text-[#a8a8ad] hover:text-white'
            }`}
          >
            Base de données
          </button>
          <button
            onClick={() => setActiveTab('feedbacks')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition flex items-center justify-center gap-2 ${
              activeTab === 'feedbacks' ? 'bg-[#3a3a3d] text-white' : 'text-[#a8a8ad] hover:text-white'
            }`}
          >
            Feedbacks utilisateurs
            {totalDislikes > 0 && (
              <span className="px-1.5 py-0.5 rounded-md text-xs bg-red-500/20 text-red-400">
                {totalDislikes}
              </span>
            )}
          </button>
        </div>

        {/* ===== TAB INGEST ===== */}
        {activeTab === 'ingest' && (
          <>
            <div className="bg-[#2a2a2d] rounded-2xl p-6 mb-6">
              <h2 className="font-medium mb-4">Ingérer un document</h2>

              <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" onChange={handleFileChange} className="hidden" />
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition mb-4 ${
                  file ? 'border-[#4a4a4d] bg-[#1c1c1e]' : 'border-[#3a3a3d] hover:border-[#4a4a4d]'
                }`}
              >
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText size={28} className="text-[#a8a8ad]" />
                    <span className="font-medium text-sm">{file.name}</span>
                    <span className="text-xs text-[#a8a8ad]">{(file.size / 1024).toFixed(1)} KB — Cliquer pour changer</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={28} className="text-[#a8a8ad]" />
                    <span className="font-medium text-sm">Déposer un fichier</span>
                    <span className="text-xs text-[#a8a8ad]">PDF, DOCX, TXT</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs text-[#a8a8ad] mb-1">Source</label>
                  <input
                    type="text"
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    placeholder="ex: HAS, Medscape, Cours P2..."
                    className="w-full bg-[#1c1c1e] border border-[#3a3a3d] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#5a5a5f] text-white placeholder:text-[#5a5a5f]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#a8a8ad] mb-1">Langue</label>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value as 'fr' | 'en')}
                    className="w-full bg-[#1c1c1e] border border-[#3a3a3d] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#5a5a5f] text-white"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              {ingestError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
                  <p className="text-sm text-red-400">{ingestError}</p>
                </div>
              )}

              <button
                onClick={handleIngest}
                disabled={ingesting || !file}
                className="w-full py-3 rounded-xl font-medium text-sm bg-white text-black hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {ingesting
                  ? <><Loader2 size={16} className="animate-spin" /> Ingestion en cours...</>
                  : <><Database size={16} /> Ingérer dans Pinecone</>
                }
              </button>
            </div>

            {results.length > 0 && (
              <div className="bg-[#2a2a2d] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-medium">Historique d'ingestion</h2>
                  <button onClick={() => setResults([])} className="text-xs text-[#a8a8ad] hover:text-white flex items-center gap-1 transition">
                    <Trash2 size={12} /> Effacer
                  </button>
                </div>
                <div className="space-y-3">
                  {results.map((r, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${r.success ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {r.success
                          ? <CheckCircle size={14} className="text-green-500" />
                          : <XCircle size={14} className="text-red-500" />
                        }
                        <span className="text-sm font-medium">{r.filename}</span>
                      </div>
                      <p className="text-xs text-[#a8a8ad]">{r.chunks_created} chunks • {(r.total_characters / 1000).toFixed(1)}k caractères</p>
                      <p className="text-xs text-green-400 mt-1">{r.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ===== TAB FEEDBACKS ===== */}
        {activeTab === 'feedbacks' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-[#2a2a2d] rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-green-400">{totalLikes}</p>
                <p className="text-xs text-[#a8a8ad] mt-1 flex items-center justify-center gap-1">
                  <ThumbsUp size={12} /> Positifs
                </p>
              </div>
              <div className="bg-[#2a2a2d] rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-red-400">{totalDislikes}</p>
                <p className="text-xs text-[#a8a8ad] mt-1 flex items-center justify-center gap-1">
                  <ThumbsDown size={12} /> Négatifs
                </p>
              </div>
              <div className="bg-[#2a2a2d] rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-white">{totalLikes + totalDislikes}</p>
                <p className="text-xs text-[#a8a8ad] mt-1">Total</p>
              </div>
            </div>

            {/* Répartition par catégorie */}
            {Object.keys(categoryCounts).length > 0 && (
              <div className="bg-[#2a2a2d] rounded-2xl p-5 mb-6">
                <p className="text-sm font-medium mb-3 text-[#a8a8ad]">Problèmes signalés</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                    <div key={cat} className="flex items-center justify-between bg-[#1c1c1e] rounded-lg px-3 py-2">
                      <span className="text-xs text-[#a8a8ad]">{CATEGORY_LABELS[cat] || cat}</span>
                      <span className="text-xs font-semibold text-red-400">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filtres + export */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1 bg-[#2a2a2d] p-1 rounded-xl flex-1">
                {(['all', 'positive', 'negative'] as FeedbackFilter[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setFeedbackFilter(f)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
                      feedbackFilter === f ? 'bg-[#3a3a3d] text-white' : 'text-[#a8a8ad] hover:text-white'
                    }`}
                  >
                    {f === 'all' ? 'Tous' : f === 'positive' ? '👍 Positifs' : '👎 Négatifs'}
                  </button>
                ))}
              </div>
              <button
                onClick={exportCSV}
                disabled={negativeFeedbacks.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-[#2a2a2d] hover:bg-[#3a3a3d] text-[#a8a8ad] hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                title="Exporter les feedbacks négatifs en CSV"
              >
                <Download size={13} /> CSV
              </button>
            </div>

            {/* Liste feedbacks */}
            {feedbacksLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-[#a8a8ad]" />
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="bg-[#2a2a2d] rounded-2xl p-8 text-center">
                <p className="text-[#a8a8ad] text-sm">Aucun feedback pour l'instant.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFeedbacks.map(fb => (
                  <div
                    key={fb.id}
                    className={`bg-[#2a2a2d] rounded-2xl border overflow-hidden ${
                      fb.is_positive ? 'border-green-500/15' : 'border-red-500/15'
                    }`}
                  >
                    {/* Header du feedback */}
                    <button
                      onClick={() => setExpandedFeedback(expandedFeedback === fb.id ? null : fb.id)}
                      className="w-full flex items-start gap-3 p-4 text-left hover:bg-[#3a3a3d]/30 transition"
                    >
                      <div className={`mt-0.5 flex-shrink-0 ${fb.is_positive ? 'text-green-400' : 'text-red-400'}`}>
                        {fb.is_positive ? <ThumbsUp size={14} /> : <ThumbsDown size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{fb.question || 'Question non disponible'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-[#6e6e73]">
                            {new Date(fb.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {fb.category && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                              {CATEGORY_LABELS[fb.category] || fb.category}
                            </span>
                          )}
                        </div>
                      </div>
                      {expandedFeedback === fb.id
                        ? <ChevronUp size={14} className="text-[#a8a8ad] flex-shrink-0 mt-1" />
                        : <ChevronDown size={14} className="text-[#a8a8ad] flex-shrink-0 mt-1" />
                      }
                    </button>

                    {/* Détails expandés */}
                    {expandedFeedback === fb.id && (
                      <div className="px-4 pb-4 space-y-3 border-t border-[#3a3a3d]">
                        <div className="pt-3">
                          <p className="text-xs font-medium text-[#a8a8ad] mb-1">Question</p>
                          <p className="text-sm text-white bg-[#1c1c1e] rounded-lg p-3">{fb.question}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[#a8a8ad] mb-1">Réponse IA</p>
                          <p className="text-sm text-[#a8a8ad] bg-[#1c1c1e] rounded-lg p-3 max-h-32 overflow-y-auto">{fb.ia_response}</p>
                        </div>
                        {fb.correction && (
                          <div>
                            <p className="text-xs font-medium text-amber-400 mb-1">Correction suggérée</p>
                            <p className="text-sm text-white bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">{fb.correction}</p>
                          </div>
                        )}
                        {fb.reason && (
                          <div>
                            <p className="text-xs font-medium text-[#a8a8ad] mb-1">Explication</p>
                            <p className="text-sm text-[#a8a8ad] bg-[#1c1c1e] rounded-lg p-3">{fb.reason}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}