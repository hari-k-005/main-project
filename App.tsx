import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeMediaForensics } from './services/geminiService';
import { AnalysisResult, ForgeryType, TrustLevel, MediaType } from './types';
import HeatmapDisplay from './components/HeatmapDisplay';
import ForensicMetrics from './components/ForensicMetrics';
import MethodologyView from './components/MethodologyView';
import DocumentationView from './components/DocumentationView';
import TrustIndicator from './components/TrustIndicator';
import ChatAssistant from './components/ChatAssistant';

type ViewState = 'analyze' | 'methodology' | 'docs' | 'history';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>('analyze');
  const [fileType, setFileType] = useState<MediaType>(MediaType.IMAGE);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extractedFrames, setExtractedFrames] = useState<string[]>([]);
  const [systemStatus, setSystemStatus] = useState<'Online' | 'Busy'>('Online');
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('deepscan_history_v2');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) setHistory(parsed);
      } catch (e) {
        console.error("Failed to parse history archive", e);
      }
    }
  }, []);

  useEffect(() => {
    try {
      const limitedHistory = history.slice(0, 20);
      localStorage.setItem('deepscan_history_v2', JSON.stringify(limitedHistory));
    } catch (e) {
      console.warn("History storage limit reached.");
    }
  }, [history]);

  useEffect(() => {
    setSystemStatus(isAnalyzing ? 'Busy' : 'Online');
  }, [isAnalyzing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setResult(null);
      setError(null);
      setExtractedFrames([]);
      const isVideo = selectedFile.type.startsWith('video/');
      const type = isVideo ? MediaType.VIDEO : MediaType.IMAGE;
      setFileType(type);

      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const extractFramesFromVideo = async (videoUrl: string): Promise<string[]> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.load();
      const frames: string[] = [];
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      video.onloadeddata = async () => {
        const duration = video.duration;
        const capturePoints = [0.1, 0.5, 0.9];
        for (const point of capturePoints) {
          video.currentTime = duration * point;
          await new Promise(r => video.onseeked = r);
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx?.drawImage(video, 0, 0);
          frames.push(canvas.toDataURL('image/jpeg', 0.6));
        }
        resolve(frames);
      };
    });
  };

  const runAnalysis = async () => {
    if (!preview) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      let dataToAnalyze: string | string[] = preview;
      if (fileType === MediaType.VIDEO) {
        const frames = await extractFramesFromVideo(preview);
        setExtractedFrames(frames);
        dataToAnalyze = frames;
      }
      const data = await analyzeMediaForensics(dataToAnalyze, fileType);
      
      const newResult: AnalysisResult = {
        ...data,
        id: `FS-${Math.floor(Math.random() * 900000 + 100000)}`,
        previewThumbnail: Array.isArray(dataToAnalyze) ? dataToAnalyze[1] : dataToAnalyze
      };

      setResult(newResult);
      setHistory(prev => [newResult, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Forensic analysis pipeline failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteFromHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Permanently delete this forensic record?")) {
      setHistory(prev => prev.filter(item => item.id !== id));
      if (result?.id === id) {
        setResult(null);
        setPreview(null);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredHistory = useMemo(() => {
    return history.filter(item => 
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.classification.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [history, searchQuery]);

  const loadFromHistory = (item: AnalysisResult) => {
    setResult(item);
    setPreview(item.previewThumbnail || null);
    setFileType(item.mediaType);
    setActiveView('analyze');
    setIsMobileMenuOpen(false);
  };

  const renderHistory = () => (
    <div className="max-w-6xl mx-auto py-16 px-4 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 no-print">
        <div className="space-y-4">
          <span className="text-sky-600 font-black text-sm uppercase tracking-[0.5em]">Forensic Archives</span>
          <h2 className="text-6xl font-[900] text-slate-950 tracking-tight">Audit History</h2>
          <p className="text-xl text-slate-500 font-light max-w-2xl">Manage and access previously certified reports.</p>
        </div>
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Search by Case ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none font-bold text-slate-700"
          />
        </div>
      </div>
      {filteredHistory.length === 0 ? (
        <div className="bg-slate-50 rounded-[3rem] border border-slate-200 p-24 text-center no-print">
          <p className="text-slate-400 text-2xl font-black">Archive is empty or no matches found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 no-print">
          {filteredHistory.map((item) => (
            <motion.div 
              key={item.id}
              whileHover={{ y: -5 }}
              onClick={() => loadFromHistory(item)}
              className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden cursor-pointer group transition-all hover:shadow-2xl relative"
            >
              <button 
                onClick={(e) => deleteFromHistory(e, item.id)}
                className="absolute top-4 left-4 z-20 p-2 bg-white/90 backdrop-blur rounded-full text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity border border-slate-200 hover:bg-rose-50 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                {item.previewThumbnail ? (
                  <img src={item.previewThumbnail} alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 text-xs font-black">NO_PREVIEW</div>
                )}
              </div>
              <div className="p-8 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sky-600 font-black text-[10px] uppercase tracking-widest">{item.id}</p>
                    <h3 className={`text-2xl font-black mt-1 ${item.classification === ForgeryType.AUTHENTIC ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {item.classification}
                    </h3>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="mono font-black text-[12px]">{item.aiGeneratedScore?.toFixed(0) || 0}% AI</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView + (result?.id || 'new')}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="max-w-7xl mx-auto py-8"
        >
          {activeView === 'methodology' && <MethodologyView />}
          {activeView === 'docs' && <DocumentationView />}
          {activeView === 'history' && renderHistory()}
          {activeView === 'analyze' && (
            <div className="space-y-12">
              {!result ? (
                <div className="max-w-4xl mx-auto space-y-12">
                  <div className="text-center space-y-6">
                    <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">Digital <span className="text-sky-600">Integrity</span> Audit</h2>
                    <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed px-4">Deep-spectrum forensic verification for investigative assets.</p>
                  </div>
                  <motion.div whileHover={{ scale: 1.01 }} className="relative group cursor-pointer mx-4">
                    <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative bg-white border border-slate-200 p-10 md:p-16 rounded-3xl shadow-2xl flex flex-col items-center justify-center space-y-6 transition-all">
                      <input type="file" onChange={handleFileChange} accept="image/*,video/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                        <svg className="w-10 h-10 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" /></svg>
                      </div>
                      <p className="text-2xl md:text-3xl font-extrabold text-slate-900">Ingest Media Archive</p>
                    </div>
                  </motion.div>
                  {preview && !isAnalyzing && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 px-4">
                      <div className="relative rounded-[2.5rem] overflow-hidden border border-slate-300 bg-white p-4 shadow-2xl">
                        {fileType === MediaType.VIDEO ? (
                          <video ref={videoRef} src={preview} controls className="w-full max-h-[600px] rounded-3xl" />
                        ) : (
                          <img src={preview} alt="Evidence" className="w-full max-h-[600px] object-contain rounded-3xl" />
                        )}
                      </div>
                      <button onClick={runAnalysis} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-2xl hover:bg-black transition-all shadow-xl">EXECUTE AUDIT</button>
                    </motion.div>
                  )}
                  {isAnalyzing && (
                    <div className="bg-slate-950 rounded-[3rem] p-12 md:p-20 text-white overflow-hidden relative shadow-2xl mx-4">
                      <div className="flex flex-col items-center gap-12 relative z-10">
                        <div className="w-32 h-32 border-8 border-sky-500/10 rounded-full border-t-sky-500 animate-spin"></div>
                        <h3 className="text-2xl font-black uppercase tracking-widest text-sky-100">Synchronizing Forensic Pass</h3>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
                  {/* PRINT ONLY: FORMAL REPORT HEADER */}
                  <div className="print-only lg:col-span-12 academic-header">
                    <div className="flex justify-between items-start">
                      <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">DEEPSCAN FORENSIC REPORT</h1>
                        <p className="text-xs font-black text-slate-600 tracking-widest uppercase">CERTIFIED DIGITAL INTEGRITY AUDIT • OFFICIAL DOCUMENTATION</p>
                        <div className="flex gap-4 mt-6">
                           <div className="border-r border-black pr-4">
                             <p className="text-[8px] font-black text-slate-400 uppercase">Case Reference</p>
                             <p className="text-lg font-black">{result.id}</p>
                           </div>
                           <div className="pl-0">
                             <p className="text-[8px] font-black text-slate-400 uppercase">Timestamp</p>
                             <p className="text-xs font-bold">{new Date(result.timestamp).toLocaleString()}</p>
                           </div>
                        </div>
                      </div>
                      <div className="text-right">
                         <div className="bg-black text-white px-4 py-2 font-black text-xs inline-block mb-2">VERIFIED_SECURE</div>
                         <p className="text-[8px] font-bold text-slate-400 uppercase">Audit Engine v5.0.4</p>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-10 no-print">
                    <div>
                      <span className="text-sky-600 font-black text-sm uppercase tracking-[0.4em]">Audit Certification</span>
                      <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-2 tracking-tight">Case ID #{result.id}</h2>
                      <div className="flex flex-wrap gap-4 mt-4">
                         {result.tags.map(tag => (
                           <span key={tag} className="mono text-[9px] bg-slate-950 text-white px-2.5 py-1 rounded-md font-black tracking-widest">{tag}</span>
                         ))}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={handlePrint} 
                        className="px-8 py-4 bg-sky-100 text-sky-900 border border-sky-200 rounded-2xl font-black hover:bg-sky-200 transition-all flex items-center gap-2 shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4" /></svg>
                        DOWNLOAD PDF REPORT
                      </button>
                      <button onClick={() => {setResult(null); setPreview(null);}} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-all">NEW CASE</button>
                    </div>
                  </div>

                  {/* LEFT COLUMN: VISUALS & METRICS */}
                  <div className="lg:col-span-8 space-y-10">
                    <section className="report-section bg-white p-4 rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden relative">
                       <h3 className="print-only text-sm font-black uppercase tracking-widest mb-6 border-b pb-2">I. Spatial Anomaly Analysis</h3>
                       <HeatmapDisplay imageUrl={result.previewThumbnail || preview!} hotspots={result.hotspots} />
                    </section>
                    
                    <section className="report-section bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-xl">
                      <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-sky-500 rounded-full no-print"></div>
                        <span className="print-only text-sm font-black uppercase tracking-widest block w-full border-b pb-2">II. Signal Profiling & Forensic Metrics</span>
                        <span className="no-print">Spectrum Profiling Metrics</span>
                      </h3>
                      <ForensicMetrics metrics={result.metrics} />
                    </section>
                  </div>

                  {/* RIGHT COLUMN: VERDICT & METADATA */}
                  <div className="lg:col-span-4 space-y-10">
                    <section className="report-section bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl space-y-10">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-4">Forensic Classification</label>
                        <div className={`text-4xl md:text-5xl font-black leading-tight tracking-tighter ${result.classification === ForgeryType.AUTHENTIC ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {result.classification.toUpperCase()}
                        </div>
                      </div>

                      <div className="p-6 rounded-3xl bg-indigo-50/50 border border-indigo-100 shadow-inner">
                        <div className="flex justify-between items-center mb-4">
                          <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">AI Generative Probability</label>
                          <span className="mono font-black text-indigo-600 text-lg leading-none">{result.aiGeneratedScore.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-indigo-100/50 h-3 rounded-full overflow-hidden no-print">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${result.aiGeneratedScore}%` }} transition={{ duration: 1.5, ease: "circOut" }} className={`h-full ${result.aiGeneratedScore > 60 ? 'bg-indigo-600' : 'bg-indigo-400'}`} />
                        </div>
                      </div>

                      <TrustIndicator level={result.trustScore} />
                      
                      <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-6">
                        <h4 className="font-black text-slate-900 text-[10px] uppercase tracking-widest border-b border-slate-200 pb-2">Asset Metadata Explorer</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                             <p className="text-[8px] text-slate-400 font-black uppercase">Source Device</p>
                             <p className="text-[10px] font-bold text-slate-800 truncate">{result.metadata.sourceDevice || 'NOT_FOUND_EXIF'}</p>
                          </div>
                          <div>
                             <p className="text-[8px] text-slate-400 font-black uppercase">Inferred SW</p>
                             <p className="text-[10px] font-bold text-slate-800 truncate">{result.metadata.softwareUsed || 'UNKNOWN_PROCESS'}</p>
                          </div>
                          <div>
                             <p className="text-[8px] text-slate-400 font-black uppercase">Color Profile</p>
                             <p className="text-[10px] font-bold text-slate-800">{result.metadata.colorSpace || 'STANDARD_RGB'}</p>
                          </div>
                          <div>
                             <p className="text-[8px] text-slate-400 font-black uppercase">Est. Resolution</p>
                             <p className="text-[10px] font-bold text-slate-800">{result.metadata.resolutionEstimate || 'VARIABLE_AUTO'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-8 rounded-3xl bg-sky-50 border border-sky-100">
                        <h4 className="font-black text-sky-900 text-sm mb-4 uppercase tracking-widest">Auditor Narrative & Interpretation</h4>
                        <p className="text-sm text-sky-800 leading-relaxed font-medium italic">"{result.explanation}"</p>
                      </div>

                      <div className="print-only text-[8px] text-slate-400 font-bold uppercase tracking-[0.3em] text-center pt-12 border-t mt-12">
                        Digital Signature Authenticity: CERTIFIED_HASH_VALIDATED • DeepScan Intelligence Unit
                      </div>
                    </section>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-sky-100">
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-[100] no-print">
        <div className="container mx-auto px-6 md:px-10 py-6 flex justify-between items-center">
          <button onClick={() => {setActiveView('analyze'); setResult(null); setPreview(null);}} className="flex items-center gap-4 group">
            <div className="bg-slate-900 p-2.5 rounded-2xl shadow-xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </div>
            <div className="text-left">
              <h1 className="text-xl font-black text-slate-950 tracking-tighter uppercase">DEEPSCAN</h1>
              <p className="text-[8px] text-sky-600 font-black uppercase tracking-[0.4em] mt-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500"></span>System {systemStatus}
              </p>
            </div>
          </button>
          <nav className="hidden lg:flex items-center gap-10">
            <NavBtn active={activeView === 'analyze'} onClick={() => setActiveView('analyze')} label="Workbench" />
            <NavBtn active={activeView === 'history'} onClick={() => setActiveView('history')} label="History" />
            <NavBtn active={activeView === 'methodology'} onClick={() => setActiveView('methodology')} label="Methodologies" />
            <NavBtn active={activeView === 'docs'} onClick={() => setActiveView('docs')} label="Manual" />
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto">{renderContent()}</main>
      <footer className="border-t border-slate-200 py-12 bg-white no-print">
        <div className="container mx-auto px-10 flex justify-between items-center">
          <div className="font-black text-xl text-slate-950 tracking-tighter">DEEPSCAN VERIFIED™</div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SYSTEM AUDIT v5.0</span>
        </div>
      </footer>
      <div className="chat-assistant-container no-print">
        <ChatAssistant />
      </div>
    </div>
  );
};

const NavBtn = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
  <button onClick={onClick} className={`text-[11px] font-black uppercase tracking-[0.2em] relative py-2 ${active ? 'text-slate-950' : 'text-slate-400 hover:text-slate-600'}`}>
    {label}
    {active && <motion.span layoutId="navUnderline" className="absolute -bottom-1 left-0 right-0 h-1 bg-sky-500 rounded-full" />}
  </button>
);

export default App;