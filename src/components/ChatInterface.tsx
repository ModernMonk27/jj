'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Poll for new messages (simple real-time)
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetch('/api/chat');
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                }
            } catch (error) {
                console.error('Failed to fetch messages', error);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const tempId = Date.now();
        const userMsg: Message = { id: tempId, role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg.content }),
            });

            if (!res.ok) throw new Error('Failed to send');

            // The poll will pick up the real message and the AI response eventually,
            // but we can also fetch immediately or wait.
            // For now, let the poll handle the AI response update to keep it simple.
        } catch (error) {
            console.error('Error sending message:', error);
            // Revert optimistic update if needed, or show error
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-stone-50">
            <header className="p-4 border-b border-stone-200 bg-white shadow-sm text-center">
                <h1 className="text-lg font-serif text-stone-800">Aravind</h1>
                <p className="text-xs text-stone-500">Online</p>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-stone-800 text-white rounded-br-none'
                                    : 'bg-white border border-stone-200 text-stone-800 rounded-bl-none shadow-sm'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-stone-200 p-3 rounded-2xl rounded-bl-none shadow-sm">
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" />
                                <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce delay-75" />
                                <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce delay-150" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t border-stone-200">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 p-3 rounded-full border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-stone-50"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="p-3 bg-stone-900 text-white rounded-full disabled:opacity-50 hover:bg-stone-800 transition-colors"
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
