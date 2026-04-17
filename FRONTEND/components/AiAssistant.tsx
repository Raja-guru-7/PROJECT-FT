import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Sparkles } from 'lucide-react';

const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: "Hello! I'm your AroundU Concierge. How can I help you today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const updatedMessages = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Add empty placeholder for AI response
    setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('x-auth-token') || '';
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/chat-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.body) throw new Error('Stream failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        lines.forEach(line => {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') return;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                setMessages(prev => {
                  const last = [...prev];
                  last[last.length - 1].content += parsed.text;
                  return last;
                });
              }
            } catch (e) { }
          }
        });
      }
    } catch (err) {
      setMessages(prev => {
        const last = [...prev];
        last[last.length - 1].content = "Connection error. Try again.";
        return last;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-10 z-[3000]">
      <div className="flex flex-col items-end gap-3 sm:gap-4">
        {isOpen && (
          <div className="fixed inset-0 sm:inset-auto sm:bottom-20 sm:right-0 w-full h-[100dvh] sm:w-[350px] md:w-[400px] sm:h-[550px] bg-[#0a0c12] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300 z-50">
            <div className="bg-[#A84bc9] p-4 sm:p-5 pt-10 sm:pt-6 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 text-white">
                <Sparkles size={16} />
                <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest italic">Concierge</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white p-1 hover:bg-white/10 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 pb-20 sm:pb-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] sm:max-w-[85%] px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-bold uppercase tracking-wide leading-relaxed ${m.role === 'user' ? 'bg-white text-black rounded-tr-none' : 'bg-white/10 text-white border border-white/15 rounded-tl-none'}`}>
                    {m.content}
                    {isLoading && m.role === 'assistant' && i === messages.length - 1 && (
                      <span className="inline-block w-1.5 h-3 ml-1 bg-[#A84bc9] animate-pulse rounded-full align-middle"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute sm:relative bottom-0 left-0 right-0 p-3 sm:p-4 bg-[#0a0c12] sm:bg-white/5 border-t border-white/10">
              <div className="relative flex items-center gap-2">
                <input
                  type="text" value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask AroundU..."
                  disabled={isLoading}
                  className="flex-1 bg-[#06070a] border border-white/20 rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 text-[10px] text-white outline-none focus:border-[#A84bc9] disabled:opacity-50"
                />
                <button onClick={handleSend} disabled={!input.trim() || isLoading} className="w-10 h-10 sm:w-11 sm:h-11 bg-[#A84bc9] text-white rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50 transition-transform active:scale-95">
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} className="ml-0.5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {!isOpen && (
          <button onClick={() => setIsOpen(true)} className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90 bg-[#A84bc9] text-white hover:brightness-110">
            <MessageSquare size={20} className="sm:w-[28px] sm:h-[28px]" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AiAssistant;