"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import QuoteBackground from "@/components/QuoteBackground";
import CloneChat from "@/components/CloneChat";
import DirectChat from "@/components/DirectChat";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import QuestionsView from "@/components/QuestionsView";

function ExperienceContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const key = searchParams.get("key");
  const [activeTab, setActiveTab] = useState<"chat" | "clone" | "analytics">(
    "clone"
  );
  const lastScrollLogRef = useRef(0);

  const logActivity = async (
    type: string,
    detail?: string,
    metadata?: Record<string, any>
  ) => {
    if (role !== "vivi") return;
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

  useEffect(() => {
    if (role !== "vivi") return;
    logActivity("vivi_enter_experience");

    const onScroll = () => {
      const now = Date.now();
      if (now - lastScrollLogRef.current > 4000) {
        lastScrollLogRef.current = now;
        logActivity("vivi_scroll_page", undefined, {
          scrollY: Math.round(window.scrollY),
          innerHeight: Math.round(window.innerHeight),
          docHeight: Math.round(document.body.scrollHeight),
        });
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  // Logic:
  // 1. role=vivi -> Show Clone Chat + Direct Chat
  // 2. role=aravind & key=valid -> Show Analytics + Direct Chat
  // 3. role=aravind & key=invalid -> Show QuestionsView

  // Note: In a real app, key validation should happen server-side or via API to be secure.
  // Here we do a simple client-side check against a known env var (exposed via next.config or just assumed for this demo).
  // Ideally, we'd fetch a "session" from an API that validates the key.
  // For this demo, we'll assume the key is "secret-key-123" (matching .env.example).
  const isValidAravind = role === "aravind" && key === "secret-key-123";

  if (!role) return null;

  // Render Logic
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <QuoteBackground />

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center text-white/80">
        <h1 className="text-xl font-serif tracking-wide">
          Where My Feelings Live
        </h1>
        <div className="text-xs uppercase tracking-widest opacity-50">
          {role === "vivi"
            ? "Vivi’s Space"
            : isValidAravind
            ? "Aravind Admin"
            : "Aravind Public"}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col max-w-5xl mx-auto w-full p-4 h-[calc(100vh-80px)]">
        {/* VIVI VIEW */}
        {role === "vivi" && (
          <div className="flex flex-col h-full">
            <div className="flex gap-4 mb-4 justify-center">
              <button
                onClick={() => setActiveTab("clone")}
                className={`px-6 py-2 rounded-full text-sm transition-all ${
                  activeTab === "clone"
                    ? "bg-white text-purple-900 font-medium"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                Clone of Aravind
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`px-6 py-2 rounded-full text-sm transition-all ${
                  activeTab === "chat"
                    ? "bg-white text-purple-900 font-medium"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                Direct Chat
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              {activeTab === "clone" ? (
                <CloneChat />
              ) : (
                <div className="h-full flex flex-col gap-4">
                  {/* Info card: this is the real me */}
                  <div className="rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-white/80 shadow-lg">
                    <p className="font-medium mb-1">
                      This is the real me, not the clone 💬
                    </p>
                    <p className="text-xs md:text-sm text-white/70 leading-relaxed">
                      Anything you share here comes directly to me, Aravind.
                      I’ll read it myself and reply back from my side. No AI in
                      the middle — just a simple, honest space to talk if you
                      ever feel like it.
                    </p>
                  </div>

                  {/* Actual direct chat UI */}
                  <div className="flex-1 min-h-0">
                    <DirectChat currentUserRole="vivi" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ARAVIND ADMIN VIEW */}
        {isValidAravind && (
          <div className="flex flex-col h-full">
            <div className="flex gap-4 mb-4 justify-center">
              <button
                onClick={() => setActiveTab("analytics")}
                className={`px-6 py-2 rounded-full text-sm transition-all ${
                  activeTab === "analytics" || activeTab === "clone"
                    ? "bg-white text-purple-900 font-medium"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`px-6 py-2 rounded-full text-sm transition-all ${
                  activeTab === "chat"
                    ? "bg-white text-purple-900 font-medium"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                Direct Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeTab === "analytics" || activeTab === "clone" ? (
                <AnalyticsDashboard />
              ) : (
                <DirectChat currentUserRole="aravind" />
              )}
            </div>
          </div>
        )}

        {/* ARAVIND PUBLIC VIEW */}
        {role === "aravind" && !isValidAravind && <QuestionsView />}
      </main>
    </div>
  );
}

export default function ExperiencePage() {
  return (
    <Suspense
      fallback={<div className="text-white text-center p-10">Loading...</div>}
    >
      <ExperienceContent />
    </Suspense>
  );
}
