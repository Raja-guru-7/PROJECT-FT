import React, { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(SOCKET_URL);

interface ChatProps {
  transactionId: string;
  currentUser: string;
  isHandoverMode?: boolean;
  chatTitle?: string;
  onClose?: () => void;
  receiverId?: string;
}

const PeerShareChat: React.FC<ChatProps> = ({ transactionId, currentUser, isHandoverMode = false, chatTitle, onClose, receiverId }) => {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  useEffect(() => {
    if (!transactionId) return;

    socket.emit('join_chat', transactionId);
    socket.emit('get_online_users');

    socket.off('receive_message');
    socket.off('chat_history');
    socket.off('user_status_change');

    socket.on('chat_history', (history: any[]) => setChatLog(history));

    socket.on('receive_message', (data: any) => {
      if (data.transactionId === transactionId) {
        setChatLog((prev) => {
          const exists = prev.some(m => m._id === data._id);
          return exists ? prev : [...prev, data];
        });
      }
    });

    socket.on('user_status_change', (onlineUsers: string[]) => {
      if (receiverId) setIsOnline(onlineUsers.includes(receiverId));
    });

    return () => {
      socket.off('receive_message');
      socket.off('chat_history');
      socket.off('user_status_change');
    };
  }, [transactionId, receiverId]);

  const sendMessage = () => {
    if (message.trim()) {
      const msgData = {
        _id: Date.now().toString(),
        transactionId,
        sender: currentUser, // Sending correct name
        text: message.trim(),
        timestamp: new Date().toISOString()
      };

      // Instant display on our screen
      setChatLog((prev) => [...prev, msgData]);

      // Send to the other person
      socket.emit('send_message', msgData);

      setMessage('');
    }
  };

  return (
    <div className={`${isHandoverMode ? 'fixed bottom-24 left-6 w-[320px] h-[400px] z-50' : 'w-full h-full'} bg-white border rounded-3xl overflow-hidden flex flex-col shadow-2xl`}>
      {/* HEADER */}
      <div className="bg-slate-900 p-4 flex justify-between items-center text-white shrink-0">
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm truncate">{chatTitle || 'Chat'}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-slate-500'}`} />
            <span className="text-[10px] text-slate-300 font-medium tracking-wide">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        {(onClose || isHandoverMode) && (
          <button onClick={() => { if (onClose) onClose(); else return; }} className="p-1.5 rounded-full hover:bg-slate-800 transition-colors"><X size={18} /></button>
        )}
      </div>

      {/* MESSAGES AREA - 100% CORRECT OPPOSITE ALIGNMENT */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {chatLog.map((msg, i) => {
          // 🚀 THE FIX: Directly comparing names. If it's your name, it goes right. If it's their name, it goes left.
          const isMe = msg.sender === currentUser;
          const messageTime = new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div key={msg._id || i} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`relative max-w-[80%] px-3 py-2 shadow-sm ${isMe
                  ? 'bg-slate-900 text-white rounded-2xl rounded-tr-sm' // YOU: Black Bubble, Right Side
                  : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm' // THEM: White Bubble, Left Side
                }`}>

                {/* Only show sender name for the OTHER person */}
                {!isMe && (
                  <p className="text-[10px] font-bold text-slate-400 mb-0.5 pr-4 truncate">
                    {msg.sender}
                  </p>
                )}

                <p className="text-[13px] leading-relaxed">
                  {msg.text}
                </p>

                <div className={`text-[9px] mt-1 text-right ${isMe ? 'text-slate-400' : 'text-slate-400'}`}>
                  {messageTime}
                </div>

              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* INPUT */}
      <div className="p-3 border-t bg-white flex gap-2 shrink-0 items-center">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type here..."
          className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-xs outline-none text-slate-800 transition-all"
        />
        <button
          onClick={sendMessage}
          disabled={!message.trim()}
          className="bg-slate-900 text-white p-2.5 rounded-full hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Send size={16} className="ml-0.5" />
        </button>
      </div>
    </div>
  );
};

export default PeerShareChat;