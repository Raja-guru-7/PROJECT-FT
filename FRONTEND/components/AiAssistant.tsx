
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, X, Send, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: "Hello! I'm your AroundU Concierge. How can I help you navigate the neighborhood mesh network today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // FIX: Per @google/genai guideline, API key must be from process.env.API_KEY without fallbacks.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages, { role: 'user', content: userMessage }].map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: "You are the AroundU Smart Concierge, an AI specialized in hyper-local P2P rentals. You help users understand the trust-first system, including bi-directional video handovers, OTP verification, and escrow logic. You are professional, emphasizing security and community trust. Keep responses concise and use tech-forward, high-security terminology like 'Nodes', 'Protocols', and 'Mesh Network'.",
          temperature: 0.7,
        },
      });

      const aiResponse = response.text || "I'm having trouble connecting to the mesh network. Please try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Security link interrupted. Please check your connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 sm:right-10 z-[2000] pointer-events-none">
      <div className="flex flex-col items-end gap-4 pointer-events-auto">
        {isOpen && (
          <div className={`w-72 sm:w-80 md:w-[400px] h-[500px] sm:h-[550px] bg-[#0a0c12] border border-white/10 rounded-[2.5rem] sm:rounded-[3rem] shadow-[0_30px_90px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300 backdrop-blur-3xl ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            {/* Header */}
            <div className="bg-[#A84bc9] p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Sparkles className="text-white" size={18} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-white italic">Smart Concierge</h3>
                  <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white/60">Neural Link Active</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 scroll-smooth">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 sm:px-4 py-2 sm:py-3 rounded-2xl text-[11px] sm:text-[11px] font-bold uppercase tracking-wide leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-white text-black rounded-tr-none' 
                      : 'bg-white/5 text-white/80 border border-white/5 rounded-tl-none'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-[#A84bc9]" />
                    <span className="text-[9px] font-black uppercase text-white/20 tracking-widest">Processing Query</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white/5 border-t border-white/5">
              <div className="relative">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask protocol..."
                  className="w-full bg-[#06070a] border border-white/10 rounded-xl py-3 sm:py-4 pl-4 sm:pl-14 text-[10px] sm:text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-[#A84bc9] transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-[#A84bc9] text-white rounded-lg flex items-center justify-center disabled:opacity-20 hover:brightness-110 transition-all"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-12 h-12 sm:w-16 sm:h-16 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(168,75,201,0.4)] transition-all active:scale-90 border border-white/20 ${
            isOpen ? 'bg-white text-black rotate-90' : 'bg-[#A84bc9] text-white'
          }`}
        >
          {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
          {isOpen && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-white text-[#A84bc9] rounded-full flex items-center justify-center shadow-lg border-2 border-[#A84bc9] animate-bounce">
              <Sparkles size={12} className="sm:size-14" fill="currentColor" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default AiAssistant;
