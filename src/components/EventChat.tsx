'use client';

import { useEffect, useState, useRef } from 'react';

const API_URL = 'https://arka-api.claws.page';

interface ChatMessage {
  type: 'chat';
  userId: string;
  username: string;
  text: string;
  timestamp: string;
}

interface EventChatProps {
  eventId: string;
  userId: string;
  username: string;
}

export default function EventChat({ eventId, userId, username }: EventChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch chat history
    fetch(`${API_URL}/events/${eventId}/chat`)
      .then(res => res.json())
      .then(data => setMessages(data.messages || []))
      .catch(console.error);

    // Connect WebSocket
    const wsUrl = API_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    const socket = new WebSocket(`${wsUrl}/ws/event/${eventId}/chat`);
    
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'chat') {
        setMessages(prev => [...prev, message]);
      }
    };

    socket.onerror = (err) => console.error('WebSocket error:', err);
    socket.onclose = () => console.log('WebSocket closed');

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [eventId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    try {
      await fetch(`${API_URL}/events/${eventId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          username,
          text: inputText,
        }),
      });
      setInputText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="text-center text-xs text-black/30">No messages yet. Start the conversation!</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`${msg.userId === userId ? 'ml-auto text-right' : ''} max-w-[80%]`}>
            <p className="text-[10px] text-black/40">{msg.username}</p>
            <div className={`mt-0.5 rounded-lg px-3 py-2 text-sm ${
              msg.userId === userId ? 'bg-arka-pink text-white' : 'bg-gray-100 text-black/80'
            }`}>
              {msg.text}
            </div>
            <p className="mt-0.5 text-[9px] text-black/30">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-black/10 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-black/10 px-4 py-2 text-sm focus:border-arka-pink focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim()}
            className="rounded-full bg-arka-pink px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
