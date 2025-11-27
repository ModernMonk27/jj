'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
    id: number;
    senderRole: string;
    text: string;
}

interface DirectChatProps {
    currentUserRole: 'aravind' | 'vivi';
}

export default function DirectChat({ currentUserRole }: DirectChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetch('/api/chat/direct');
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                }
            } catch (error) {
                console.error('Failed to fetch messages', error);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const tempId = Date.now();
        const userMsg: Message = { id: tempId, senderRole: currentUserRole, text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat/direct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: userMsg.text, senderRole: currentUserRole }),
            });

            if (!res.ok) throw new Error('Failed to send');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md overflow-hidden">
            <header className="p-4 border-b border-white/10 bg-white/5 text-center">
                <h2 className="text-lg font-serif text-white">Direct Chat</h2>
                <p className="text-xs text-white/50">Real-time connection</p>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isMe = msg.senderRole === currentUserRole;
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${isMe
                                    ? 'bg-purple-600/80 text-white rounded-br-none'
                                    : 'bg-white/10 border border-white/10 text-white/90 rounded-bl-none'
                                    }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/10">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Write a message..."
                        className="flex-1 p-3 rounded-full border border-white/20 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="p-3 bg-purple-600 text-white rounded-full disabled:opacity-50 hover:bg-purple-500 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
}
