"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useMemo } from "react";

interface Message {
  id: number;
  senderRole: string; // "vivi" | "clone" | etc.
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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const lastScrollLogRef = useRef(0);

  const logActivity = async (
    type: string,
    detail?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      await fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          detail,
          metadata,
          path: "/experience?role=vivi",
          userRole: "vivi",
        }),
      });
    } catch (e) {
      console.error("Failed to log activity", e);
    }
  };

  // Light client-side clean-up to keep streamed text tidy if the model sends stage directions.
  const sanitizeClientText = (text: string) => {
    let result = text.trim();
    result = result.replace(/```[\s\S]*?```/g, "");
    result = result.replace(/\*[^*\n]{0,120}\*/g, " ");
    result = result.replace(/_[^_\n]{0,120}_/g, " ");
    result = result.replace(/^\s*\*[^*\n]{0,120}\*\s*/g, "");
    result = result.replace(/\s*\*[^*\n]{0,120}\*\s*$/g, "");
    result = result.replace(/^\s*[_*]+(.*?)[_*]+\s*$/s, "$1").trim();
    result = result.replace(/\s+/g, " ").trim();
    return result;
  };

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

  useEffect(() => {
    fetchMessages();
    logActivity("vivi_visit_clonechat");
  }, []);

  useEffect(() => {
    if (isAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendToAgent = async (text: string) => {
    if (!text.trim() || loading) return;

    const tempId = Date.now();
    const userMsg: Message = { id: tempId, senderRole: "vivi", text };
    const cloneTempId = tempId + 1;

    // Optimistically show Vivi's message and a streaming placeholder for the clone.
    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: cloneTempId, senderRole: "clone", text: "" },
    ]);
    setInput("");
    setLoading(true);
    logActivity("vivi_send_message", undefined, { length: text.length });

    try {
      const res = await fetch("/api/chat/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok || !res.body) throw new Error("Failed to send");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamingText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        streamingText += decoder.decode(value, { stream: true });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === cloneTempId ? { ...m, text: streamingText } : m
          )
        );
      }

      // Flush any remaining decoded text.
      streamingText += decoder.decode();
      const cleaned = sanitizeClientText(streamingText);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === cloneTempId ? { ...m, text: cleaned } : m
        )
      );

      // Refresh from server to align with persisted IDs/text.
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove the placeholder clone message on failure.
      setMessages((prev) => prev.filter((m) => m.id !== cloneTempId));
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    await sendToAgent(input);
  };

  const starterQuestions = [
    "What exactly did you want from me?",
    "Why did you hesitate back then?",
    "What stopped you from expressing everything?",
    "Did you ever imagine a future with me?",
    "Why couldn't you forget me?",
    "Why were you scared to talk openly?",
  ];

  // 🌙 Whisper suggestion that adapts to the moment
  const whisperSuggestion = useMemo(() => {
    if (messages.length === 0) {
      return "You can start with how you felt on that birthday, or what you wish he had said.";
    }

    const last = messages[messages.length - 1];

    if (last.senderRole !== "vivi") {
      // Last message from clone (or anyone else)
      return "You can reply in your own words, or just tap one of the questions above.";
    }

    // Last message from Vivi
    return "If it feels heavy to type more, you can always tap a question above and let the clone carry it for you.";
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md overflow-hidden">
      <header className="p-4 border-b border-white/10 bg-white/5 text-center">
        <h2 className="text-lg font-serif text-white">Clone of Aravind</h2>
        <p className="text-xs text-white/50">
          A belated birthday space for all the unsent words between us
        </p>
      </header>

      <div className="p-4 space-y-3 border-b border-white/10 bg-gradient-to-r from-purple-900/40 to-pink-600/30 text-white">
        <div className="p-4 rounded-xl bg-white/10 border border-white/10 space-y-3">
          <p className="text-sm leading-relaxed">
            Hey Vivi. I&apos;m Aravind&apos;s clone — late to your birthday, but
            fully here now. He built me because he missed saying things on time:
            the wish, the truth, and the answers to questions that never got
            asked out loud. You can ask me anything; I&apos;ll answer with what
            he&apos;s shared, and if I don&apos;t know, I&apos;ll carry it back
            to him and return with more clarity.
          </p>
          <p className="text-xs text-white/70">
            These are some things he knows might be sitting quietly in your
            mind. Tap any of them to send it as a question.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {starterQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  logActivity("vivi_click_starter_question", q);
                  sendToAgent(q);
                }}
                className="text-left rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs leading-relaxed cursor-pointer hover:bg-white/10 hover:border-white/30 transition-colors"
              >
                {q}
              </button>
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
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.innerHTML =
                        '<div class="w-full h-full bg-white/5 flex items-center justify-center text-white/60 text-xs">Photo not found</div>';
                    }
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

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={(e) => {
          const el = e.currentTarget;
          const distanceFromBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight;
          isAtBottomRef.current = distanceFromBottom < 80;

          const now = Date.now();
          if (now - lastScrollLogRef.current > 4000) {
            lastScrollLogRef.current = now;
            logActivity("vivi_scroll_clonechat", undefined, {
              scrollTop: Math.round(el.scrollTop),
              scrollHeight: Math.round(el.scrollHeight),
              clientHeight: Math.round(el.clientHeight),
            });
          }
        }}
      >
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
        <div className="flex flex-col gap-1">
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
          <p className="text-[11px] text-white/50 pl-3">{whisperSuggestion}</p>
        </div>
      </form>
    </div>
  );
}
