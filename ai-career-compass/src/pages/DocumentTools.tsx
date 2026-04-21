import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, FileText, MessageSquare, Send, Sparkles, Bot, User as UserIcon, X, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { documentAPI } from '@/services/api';

type Mode = 'summary' | 'keyTerms' | 'studyGuide';
type Tab = 'summarize' | 'ask';

interface SummaryResult {
  title: string;
  points: string[];
  terms: string[];
  actions: string[];
}

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

const MODES: { key: Mode; label: string }[] = [
  { key: 'summary', label: 'Document Summary' },
  { key: 'keyTerms', label: 'Extract Key Terms' },
  { key: 'studyGuide', label: 'Create Study Guide' },
];

const DocumentTools = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [tab, setTab] = useState<Tab>('summarize');
  const [mode, setMode] = useState<Mode>('summary');
  const [file, setFile] = useState<File | null>(null);
  const [docText, setDocText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  // Store results per mode independently
  const [results, setResults] = useState<Record<Mode, SummaryResult | null>>({
    summary: null,
    keyTerms: null,
    studyGuide: null,
  });
  const [error, setError] = useState('');

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleFileSelect = (selected: File) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowed.includes(selected.type) && !selected.name.match(/\.(pdf|docx|txt)$/i)) {
      setError('Only PDF, DOCX, or TXT files are supported.');
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB.');
      return;
    }
    setFile(selected);
    setResults({ summary: null, keyTerms: null, studyGuide: null });
    setError('');
    setDocText('');
    setChatMessages([]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleSummarize = async () => {
    if (!file) { setError('Please upload a document first.'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await documentAPI.summarize(file, mode);
      setResults(prev => ({ ...prev, [mode]: data.result }));
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to summarize. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!chatInput.trim()) return;
    if (!file && !docText) { setError('Please upload a document first.'); return; }

    const question = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: question }]);
    setChatLoading(true);
    setError('');

    try {
      let data;
      if (docText) {
        // follow-up: use cached text
        data = await documentAPI.askWithText(docText, question, chatMessages);
      } else {
        // first question: send file
        data = await documentAPI.askWithFile(file!, question, chatMessages);
        // cache the text for follow-ups by sending a dummy extract — backend returns answer only
        // We'll store the file reference and re-send on each message (simpler approach)
      }
      setChatMessages(prev => [...prev, { role: 'ai', text: data.answer }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I could not process your question. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Document <span className="gradient-text">Tools</span></h1>
          <p className="text-muted-foreground text-sm mb-8">AI-powered document analysis and Q&A</p>

          {/* Tabs */}
          <div className="flex rounded-lg bg-secondary p-1 mb-8 max-w-md">
            {(['summarize', 'ask'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${tab === t ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>
                {t === 'summarize' ? <><FileText className="h-4 w-4" /> Summarize</> : <><MessageSquare className="h-4 w-4" /> Ask AI</>}
              </button>
            ))}
          </div>

          {/* File Upload (shared) */}
          <div className="max-w-3xl mb-6">
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="glass-card rounded-2xl p-8 text-center border-dashed border-2 border-border hover:border-primary/40 transition-colors cursor-pointer"
            >
              <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" className="hidden"
                onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-semibold text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setFile(null); setResults({ summary: null, keyTerms: null, studyGuide: null }); setDocText(''); setChatMessages([]); }}
                    className="ml-4 text-muted-foreground hover:text-destructive transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-semibold mb-1">Drop your document here or click to browse</p>
                  <p className="text-sm text-muted-foreground">PDF, DOCX, or TXT – up to 10MB</p>
                </>
              )}
            </div>
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          </div>

          {/* ── Summarize Tab ── */}
          {tab === 'summarize' && (
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-3 mb-6">
                {MODES.map(o => (
                  <button key={o.key} onClick={() => { setMode(o.key); setError(''); }}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${mode === o.key ? 'gradient-bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                    {o.label}
                    {results[o.key] && <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />}
                  </button>
                ))}
              </div>

              <button onClick={handleSummarize} disabled={loading || !file}
                className="gradient-bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:opacity-90 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                {loading ? 'Analyzing...' : 'Summarize'}
              </button>

              {results[mode] && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6 mt-6">
                  <h3 className="font-bold text-lg mb-4">{results[mode]!.title}</h3>
                  <div className="space-y-5">

                    {/* Key Points — shown for summary and studyGuide */}
                    {results[mode]!.points.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">
                          {mode === 'studyGuide' ? 'Study Points' : 'Key Points'}
                        </h4>
                        <ul className="space-y-2">
                          {results[mode]!.points.map((p, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span> {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Key Terms — shown for keyTerms and studyGuide */}
                    {results[mode]!.terms.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Key Terms</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {results[mode]!.terms.map((t, i) => (
                            <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">{t}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Items — shown for studyGuide only */}
                    {results[mode]!.actions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Action Items</h4>
                        <ul className="space-y-1">
                          {results[mode]!.actions.map((a, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="text-accent">✓</span> {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Empty state fallback */}
                    {results[mode]!.points.length === 0 && results[mode]!.terms.length === 0 && results[mode]!.actions.length === 0 && (
                      <p className="text-sm text-muted-foreground">No content could be extracted. Please try again.</p>
                    )}

                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* ── Ask AI Tab ── */}
          {tab === 'ask' && (
            <div className="max-w-3xl">
              <div className="glass-card rounded-xl p-4 mb-4 min-h-[300px] max-h-[480px] overflow-y-auto space-y-4">
                {chatMessages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center mt-16">
                    Upload a document above, then ask anything about it.
                  </p>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'ai' && (
                      <div className="h-8 w-8 rounded-full gradient-bg-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                    <div className={`max-w-[80%] p-3 rounded-xl text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary/10 text-foreground' : 'bg-secondary text-foreground'}`}>
                      {msg.text}
                    </div>
                    {msg.role === 'user' && (
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <UserIcon className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full gradient-bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="bg-secondary p-3 rounded-xl">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="flex gap-3">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your document..."
                  className="flex-1 bg-secondary rounded-lg px-4 py-2.5 text-sm border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button onClick={handleAsk} disabled={chatLoading || !chatInput.trim()}
                  className="gradient-bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Try: "What are the key takeaways?", "Explain the main methodology", "Create a quiz from this"
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DocumentTools;
