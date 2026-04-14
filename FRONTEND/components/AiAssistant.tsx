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
      <div className="flex flex-col items-end gap-3 sm:gap-4">
        {isOpen && (
          <div className="fixed inset-0 sm:inset-auto sm:bottom-20 sm:right-0 w-full h-[100dvh] sm:w-[350px] md:w-[400px] sm:h-[550px] bg-[#0a0c12] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300 z-50">
            <div className="bg-[#A84bc9] p-4 sm:p-5 pt-10 sm:pt-6 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 text-white">
                <Sparkles size={16} className="sm:w-[18px] sm:h-[18px]" />
                <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest italic">Concierge</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 pb-20 sm:pb-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] sm:max-w-[85%] px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-bold uppercase tracking-wide leading-relaxed ${m.role === 'user' ? 'bg-white text-black rounded-tr-none' : 'bg-white/10 text-white border border-white/15 rounded-tl-none'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && <Loader2 size={14} className="animate-spin text-white mx-auto" />}
            </div>

            <div className="absolute sm:relative bottom-0 left-0 right-0 p-3 sm:p-4 bg-[#0a0c12] sm:bg-white/5 border-t border-white/10 sm:border-white/5">
              <div className="relative flex items-center gap-2">
                <input
                  type="text" value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask..."
                  className="flex-1 bg-[#06070a] border border-white/20 sm:border-white/10 rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 text-[10px] text-white outline-none focus:border-[#A84bc9] shadow-inner"
                />
                <button onClick={handleSend} disabled={!input.trim()} className="w-10 h-10 sm:w-11 sm:h-11 bg-[#A84bc9] text-white rounded-xl flex items-center justify-center shrink-0">
                  <Send size={14} className="sm:w-4 sm:h-4 ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90 bg-[#A84bc9] text-white"
          >
            <MessageSquare size={20} className="sm:w-[28px] sm:h-[28px]" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AiAssistant;