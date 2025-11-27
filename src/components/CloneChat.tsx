"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

interface Message {
  id: number;
  senderRole: string;
  text: string;
}

interface PhotoCard {
  url: string;
  description: string;
}

export default function CloneChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 📸 ADD YOUR PHOTOS HERE - Place photos in /public folder
  const photos: PhotoCard[] = [
    {
      url: "/photo1.jpg",
      description: "A birthday moment that still glows in my memory.",
    },
    {
      url: "/photo2.jpg",
      description:
        "An outing I’ll never forget — laughter, warmth, and your presence.",
    },
    {
      url: "/photo3.jpg",
      description:
        "Some memories don’t fade… they stay quietly stitched to the heart.",
    },
    {
      url: "/photo4.jpg",
      description:
        "Your first birthday with me in your world — a moment I still carry softly.",
    },
    // Add more photos here
  ];

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/chat/clone");
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const tempId = Date.now();
    const userMsg: Message = { id: tempId, senderRole: "vivi", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userMsg.text }),
      });

      if (!res.ok) throw new Error("Failed to send");
      // Poll will update the rest
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md overflow-hidden">
      <header className="p-4 border-b border-white/10 bg-white/5 text-center">
        <h2 className="text-lg font-serif text-white">Clone of Aravind</h2>
        <p className="text-xs text-white/50">
          A Birthday Space & A Trusting Place Between Us{" "}
        </p>
      </header>

      <div className="p-4 space-y-3 border-b border-white/10 bg-gradient-to-r from-purple-900/40 to-pink-600/30 text-white">
        <div className="p-4 rounded-xl bg-white/10 border border-white/10 space-y-3">
          <p className="text-sm leading-relaxed">
            Happy Birthday, Vivi! I'm Aravind's clone. Ask me anything about
            him. I will answer with what I know, and if I don't, I'll check with
            Aravind and bring it back. I'm here to keep things light, honest,
            and to pass messages between you both.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              "What exactly did you want from me?",
              "Why did you hesitate?",
              "What stopped you from expressing everything?",
              "Did you ever imagine a future with me?",
              "Why couldn't you forget me?",
              "Why were you scared to talk openly?",
            ].map((q) => (
              <div
                key={q}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs leading-relaxed"
              >
                {q}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-white/70 mb-2">
            <span>Photo lane</span>
            <span>{photos.length} memories</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo, idx) => (
              <div
                key={idx}
                className="relative h-28 rounded-xl overflow-hidden border border-white/10 bg-white/5"
              >
                <Image
                  src={photo.url}
                  alt={photo.description}
                  width={800}
                  height={600}
                  quality={95}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if image doesn't load
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement!.innerHTML =
                      '<div class="w-full h-full bg-white/5 flex items-center justify-center text-white/60 text-xs">Photo not found</div>';
                  }}
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-[11px] leading-snug text-white">
                  {photo.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.senderRole === "vivi" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                msg.senderRole === "vivi"
                  ? "bg-pink-600/80 text-white rounded-br-none"
                  : "bg-white/10 border border-white/10 text-white/90 rounded-bl-none shadow-[0_10px_40px_-20px_rgba(255,255,255,0.4)]"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 border border-white/10 p-3 rounded-2xl rounded-bl-none">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce delay-75" />
                <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="p-4 bg-white/5 border-t border-white/10"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the clone anything..."
            className="flex-1 p-3 rounded-full border border-white/20 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-pink-600 text-white rounded-full disabled:opacity-50 hover:bg-pink-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
