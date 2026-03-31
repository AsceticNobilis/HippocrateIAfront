import { useState, useRef } from 'react';
import { X, Upload, FileText, Loader2, CheckCircle, XCircle, ChevronDown, ChevronUp, Sparkles, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { useTranslation } from '../lib/useTranslation';
import { callReplicate } from '../lib/replicate';

interface QCMQuestion {
  question: string;
  options: { A: string; B: string; C: string; D: string; E?: string };
  correct_answer: string;
  explanation: string;
}

interface QCMGeneratorProps {
  isDarkMode: boolean;
  onClose: () => void;
}

export default function QCMGenerator({ isDarkMode, onClose }: QCMGeneratorProps) {
  const { tr } = useTranslation();
  const [mode, setMode] = useState<'file' | 'text'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QCMQuestion[]>([]);
  const [error, setError] = useState('');
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [expandedExplanations, setExpandedExplanations] = useState<Record<number, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bg           = isDarkMode ? 'bg-[#1c1c1e]' : 'bg-white';
  const surface      = isDarkMode ? 'bg-[#2a2a2d]' : 'bg-gray-100';
  const border       = isDarkMode ? 'border-[#3a3a3d]' : 'border-gray-300';
  const textPrimary  = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-[#a8a8ad]' : 'text-gray-500';
  const hoverSurface = isDarkMode ? 'hover:bg-[#3a3a3d]' : 'hover:bg-gray-200';
  const btnPrimary   = isDarkMode
    ? 'bg-[#2a2a2d] hover:bg-[#3a3a3d] text-white border border-[#3a3a3d]'
    : 'bg-gray-900 hover:bg-gray-800 text-white';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { setError(tr('qcmFileTooLarge')); return; }
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (!validTypes.includes(f.type)) { setError(tr('qcmFileUnsupported')); return; }
    setFile(f);
    setError('');
  };

  const handleGenerate = async () => {
    setError('');
    setQuestions([]);
    setUserAnswers({});
    setShowResults(false);
    setLoading(true);

    try {
      let data: any;

      if (mode === 'file' && file) {
        // Conversion fichier en base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        data = await callReplicate({
          action: 'upload-qcm',
          file_base64: base64,
          file_name: file.name,
          num_questions: numQuestions,
          language,
        });
      } else {
        data = await callReplicate({
          action: 'generate-qcm-text',
          text,
          num_questions: numQuestions,
          language,
        });
      }

      if (!data.success) throw new Error(data.error || tr('unknownError'));
      setQuestions(data.questions);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : tr('unknownError'));
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (qIndex: number, option: string) => {
    if (showResults) return;
    setUserAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = () => {
    if (Object.keys(userAnswers).length < questions.length) {
      setError(tr('qcmAnswerAll'));
      return;
    }
    setError('');
    setShowResults(true);
  };

  const score = showResults
    ? questions.filter((q, i) => userAnswers[i] === q.correct_answer).length
    : 0;

  const toggleExplanation = (i: number) => {
    setExpandedExplanations(prev => ({ ...prev, [i]: !prev[i] }));
  };

  const reset = () => {
    setQuestions([]);
    setUserAnswers({});
    setShowResults(false);
    setError('');
    setExpandedExplanations({});
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin    = 15;
    const maxWidth  = pageWidth - margin * 2;
    let y = 20;

    const addText = (
      txt: string,
      fontSize: number,
      bold: boolean = false,
      color: [number, number, number] = [0, 0, 0]
    ) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(txt, maxWidth);
      lines.forEach((line: string) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(line, margin, y);
        y += fontSize * 0.5;
      });
      y += 3;
    };

    addText('QCM - HippocrateIA', 18, true, [30, 30, 30]);
    addText(`${new Date().toLocaleDateString()} • ${questions.length} questions`, 10, false, [120, 120, 120]);
    y += 5;

    questions.forEach((q, i) => {
      if (y > 250) { doc.addPage(); y = 20; }
      addText(`Question ${i + 1} : ${q.question}`, 12, true, [20, 20, 20]);
      Object.entries(q.options).forEach(([key, val]) => {
        if (val) addText(`  ${key}. ${val}`, 10, false, [60, 60, 60]);
      });
      addText(`${tr('qcmScore')} : ${q.correct_answer}`, 10, true, [0, 120, 60]);
      addText(`${tr('qcmExplanation')} : ${q.explanation}`, 10, false, [80, 80, 80]);
      y += 5;
      if (i < questions.length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
      }
    });

    doc.save(`QCM_HippocrateIA_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl ${bg} shadow-2xl`}>

        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b ${border} flex-shrink-0`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${surface}`}>
              <Sparkles size={18} className={textSecondary} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${textPrimary}`}>{tr('qcmTitle')}</h2>
              <p className={`text-xs ${textSecondary}`}>Powered by Llama 3.1</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {questions.length > 0 && (
              <button
                onClick={downloadPDF}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${surface} ${hoverSurface} ${textSecondary}`}
                title={tr('qcmDownloadPDF')}
              >
                <Download size={16} />
                PDF
              </button>
            )}
            <button onClick={onClose} className={`p-2 rounded-lg transition ${hoverSurface}`}>
              <X size={20} className={textSecondary} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {questions.length === 0 ? (
            <>
              {/* Mode tabs */}
              <div className={`flex rounded-xl p-1 ${surface}`}>
                {(['file', 'text'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                      mode === m
                        ? isDarkMode ? 'bg-[#3a3a3d] text-white' : 'bg-white text-gray-900 shadow-sm'
                        : textSecondary
                    }`}
                  >
                    {m === 'file' ? tr('qcmFromFile') : tr('qcmFromText')}
                  </button>
                ))}
              </div>

              {/* File upload */}
              {mode === 'file' ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                      file
                        ? isDarkMode ? 'border-[#4a4a4d] bg-[#2a2a2d]' : 'border-gray-400 bg-gray-50'
                        : isDarkMode ? 'border-[#3a3a3d] hover:border-[#4a4a4d]' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {file ? (
                      <div className="flex flex-col items-center gap-2">
                        <FileText size={32} className={textSecondary} />
                        <span className={`font-medium text-sm ${textPrimary}`}>{file.name}</span>
                        <span className={`text-xs ${textSecondary}`}>{(file.size / 1024).toFixed(1)} KB</span>
                        <span className={`text-xs ${isDarkMode ? 'text-[#5a5a5f]' : 'text-gray-400'}`}>{tr('qcmClickToChange')}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload size={32} className={textSecondary} />
                        <span className={`font-medium text-sm ${textPrimary}`}>{tr('qcmDropFile')}</span>
                        <span className={`text-xs ${textSecondary}`}>{tr('qcmDropFileDesc')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder={tr('qcmTextPlaceholder')}
                  rows={6}
                  className={`w-full rounded-xl p-4 text-sm border outline-none resize-none ${surface} ${border} ${textPrimary} focus:ring-2 ${isDarkMode ? 'focus:ring-[#4a4a4d]' : 'focus:ring-gray-400'}`}
                />
              )}

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-medium mb-2 ${textSecondary}`}>{tr('qcmNumQuestions')}</label>
                  <select
                    value={numQuestions}
                    onChange={e => setNumQuestions(Number(e.target.value))}
                    className={`w-full rounded-lg px-3 py-2 text-sm border outline-none ${surface} ${border} ${textPrimary} focus:ring-2 ${isDarkMode ? 'focus:ring-[#4a4a4d]' : 'focus:ring-gray-400'}`}
                  >
                    {[3, 5, 10, 15, 20].map(n => (
                      <option key={n} value={n}>{n} questions</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-2 ${textSecondary}`}>{tr('qcmLanguage')}</label>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value as 'fr' | 'en')}
                    className={`w-full rounded-lg px-3 py-2 text-sm border outline-none ${surface} ${border} ${textPrimary} focus:ring-2 ${isDarkMode ? 'focus:ring-[#4a4a4d]' : 'focus:ring-gray-400'}`}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading || (mode === 'file' ? !file : !text.trim())}
                className={`w-full py-3 rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 ${btnPrimary} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> {tr('qcmGenerating')}</>
                ) : (
                  <><Sparkles size={16} /> {tr('qcmGenerate')} {numQuestions} questions</>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Score banner */}
              {showResults && (
                <div className={`rounded-xl p-4 flex items-center justify-between ${
                  score >= questions.length * 0.7
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-amber-500/10 border border-amber-500/20'
                }`}>
                  <div>
                    <p className={`font-semibold ${score >= questions.length * 0.7 ? 'text-green-500' : 'text-amber-500'}`}>
                      {tr('qcmScore')} : {score} / {questions.length}
                    </p>
                    <p className={`text-xs ${textSecondary}`}>
                      {score >= questions.length * 0.7 ? tr('qcmExcellent') : tr('qcmKeepStudying')}
                    </p>
                  </div>
                  <button
                    onClick={reset}
                    className={`text-xs px-3 py-2 rounded-lg ${surface} ${textSecondary} ${hoverSurface} transition`}
                  >
                    {tr('qcmRestart')}
                  </button>
                </div>
              )}

              {/* Questions */}
              <div className="space-y-4">
                {questions.map((q, i) => {
                  const answered  = userAnswers[i];

                  return (
                    <div key={i} className={`rounded-xl p-4 border ${border} ${surface}`}>
                      <p className={`text-sm font-medium mb-3 ${textPrimary}`}>
                        <span className={`text-xs font-semibold mr-2 ${textSecondary}`}>Q{i + 1}</span>
                        {q.question}
                      </p>

                      <div className="space-y-2">
                        {(Object.entries(q.options) as [string, string][])
                          .filter(([, val]) => val)
                          .map(([key, val]) => {
                            const correctAnswers  = q.correct_answer.split(',').map(a => a.trim());
                            const isCorrectOption = correctAnswers.includes(key);

                            let optionStyle = `${isDarkMode ? 'bg-[#1c1c1e] hover:bg-[#3a3a3d]' : 'bg-white hover:bg-gray-50'} border ${border}`;

                            if (showResults) {
                              if (isCorrectOption) {
                                optionStyle = 'bg-green-500/10 border border-green-500/30';
                              } else if (key === answered && !isCorrectOption) {
                                optionStyle = 'bg-red-500/10 border border-red-500/30';
                              } else {
                                optionStyle = `${isDarkMode ? 'bg-[#1c1c1e]' : 'bg-white'} border ${border} opacity-50`;
                              }
                            } else if (answered === key) {
                              optionStyle = `${isDarkMode ? 'bg-[#3a3a3d] border-[#5a5a5f]' : 'bg-gray-200 border-gray-400'} border`;
                            }

                            return (
                              <button
                                key={key}
                                onClick={() => handleAnswer(i, key)}
                                disabled={showResults}
                                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition flex items-center gap-3 ${optionStyle} disabled:cursor-default`}
                              >
                                <span className={`font-semibold text-xs w-5 flex-shrink-0 ${textSecondary}`}>{key}</span>
                                <span className={textPrimary}>{val}</span>
                                {showResults && isCorrectOption && (
                                  <CheckCircle size={14} className="ml-auto text-green-500 flex-shrink-0" />
                                )}
                                {showResults && key === answered && !isCorrectOption && (
                                  <XCircle size={14} className="ml-auto text-red-500 flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}
                      </div>

                      {/* Explication */}
                      {showResults && (
                        <div className="mt-3">
                          <button
                            onClick={() => toggleExplanation(i)}
                            className={`flex items-center gap-1 text-xs ${textSecondary} ${hoverSurface} px-2 py-1 rounded transition`}
                          >
                            {expandedExplanations[i] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            {tr('qcmExplanation')}
                          </button>
                          {expandedExplanations[i] && (
                            <p className={`mt-2 text-xs leading-relaxed p-3 rounded-lg ${isDarkMode ? 'bg-[#1c1c1e]' : 'bg-white'} ${textSecondary}`}>
                              {q.explanation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              {!showResults ? (
                <button
                  onClick={handleSubmit}
                  className={`w-full py-3 rounded-xl font-medium text-sm transition ${btnPrimary}`}
                >
                  {tr('qcmValidate')} ({Object.keys(userAnswers).length}/{questions.length})
                </button>
              ) : (
                <button
                  onClick={reset}
                  className={`w-full py-3 rounded-xl font-medium text-sm transition ${btnPrimary}`}
                >
                  {tr('qcmNewQCM')}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}