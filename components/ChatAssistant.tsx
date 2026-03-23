import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithForensicAI } from '../services/geminiService';

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'DeepScan Intelligence Online. Upload an asset for analysis, or ask me about forensic methodology.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = input.trim();
    setInput('');
    
    // Optimistically add user message
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      // Pass the current message AND the history for context awareness
      const responseText = await chatWithForensicAI(userMsg, messages);
      
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: responseText || "I encountered an error processing that signal. Please rephrase." 
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: 'System override: Connection to forensic core lost. Please check your network and retry.' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[250] no-print">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-slate-950 text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-sky-500 rounded-full animate-ping absolute inset-0"></div>
                  <div className="w-3 h-3 bg-sky-500 rounded-full relative"></div>
                </div>
                <div>
                  <h3 className="font-black text-[10px] uppercase tracking-[0.3em] leading-none">Intelligence Unit</h3>
                  <p className="text-[7px] text-sky-400 font-bold uppercase mt-1 tracking-widest">Gemini 3 Pro Deep Reasoning</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Chat Messages */}
            <div 
              ref={scrollRef} 
              className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50/50 hud-grid"
            >
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-3xl text-[12px] leading-relaxed shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-br-none font-medium' 
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none font-medium'
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 p-4 rounded-3xl rounded-bl-none flex items-center gap-2 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Reasoning</span>
                    <span className="w-1 h-1 bg-sky-500 rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-sky-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1 h-1 bg-sky-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-2 bg-slate-100 p-1 rounded-[1.5rem] border border-slate-200 focus-within:border-sky-500/50 transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a technical question..."
                  className="flex-grow bg-transparent px-4 py-3 text-xs font-bold text-slate-800 outline-none"
                />
                <button 
                  onClick={handleSend} 
                  disabled={isTyping || !input.trim()} 
                  className="bg-slate-900 text-white px-4 rounded-[1.2rem] transition-all hover:bg-black active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <p className="text-[8px] text-center text-slate-400 mt-2 font-black uppercase tracking-widest">
                DeepScan AI Core v4.9 • Investigative Support
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-slate-950 text-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white transition-transform relative group"
      >
        <div className="absolute inset-0 bg-sky-500 rounded-full scale-0 group-hover:scale-100 transition-transform opacity-10"></div>
        <svg className="w-7 h-7 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </motion.button>
    </div>
  );
};

export default ChatAssistant;