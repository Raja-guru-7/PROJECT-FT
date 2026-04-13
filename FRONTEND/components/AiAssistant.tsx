import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, X, Send, Loader2, Sparkles } from 'lucide-react';

const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: "Hello! I'm your AroundU Concierge." }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages, { role: 'user', content: userMessage }].map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        config: { temperature: 0.7 },
      });
      setMessages(prev => [...prev, { role: 'assistant', content: response.text || "Connection error." }]);
    } catch (e) { setMessages(prev => [...prev, { role: 'assistant', content: "Protocol error." }]); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-10 z-[3000]">
      <div className="flex flex-col items-end gap-4">
        {isOpen && (
          <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-0 w-full h-full sm:w-[350px] md:w-[400px] sm:h-[550px] bg-[#0a0c12] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-[#A84bc9] p-5 pt-12 sm:pt-6 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <Sparkles size={18} />
                <h3 className="text-xs font-black uppercase tracking-widest italic">Concierge</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white"><X size={24} /></button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-wide leading-relaxed ${m.role === 'user' ? 'bg-white text-black rounded-tr-none' : 'bg-white/10 text-white border border-white/15 rounded-tl-none'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && <Loader2 size={14} className="animate-spin text-white mx-auto" />}
            </div>

            <div className="p-4 bg-white/5 border-t border-white/5">
              <div className="relative flex items-center gap-2">
                <input
                  type="text" value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask..."
                  className="flex-1 bg-[#06070a] border border-white/10 rounded-xl py-3 px-4 text-[10px] text-white outline-none focus:border-[#A84bc9]"
                />
                <button onClick={handleSend} disabled={!input.trim()} className="w-10 h-10 bg-[#A84bc9] text-white rounded-xl flex items-center justify-center">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90 ${isOpen ? 'bg-white text-black' : 'bg-[#A84bc9] text-white'}`}
        >
          {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        </button>
      </div>
    </div>
  );
};

export default AiAssistant;