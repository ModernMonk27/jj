'use client';

import { useState, useEffect, useMemo } from "react";

type Analysis = {
  summary?: string;
  tone?: string;
  themes?: string[];
  questionsSheRepeated?: string[];
  recommendationsForAravind?: string[];
};

type ActivityEvent = {
  id: number;
  createdAt: string;
  type: string;
  detail?: string | null;
  path?: string | null;
  userRole?: string | null;
};

export default function AnalyticsDashboard() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (data?.analysis) {
          setAnalysis(data.analysis);
          setEvents(data.events || []);
        } else {
          setAnalysis(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const formattedEvents = useMemo(() => {
    return events.map((e) => {
      const ts = new Date(e.createdAt);
      const time = ts.toLocaleString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short",
      });
      return { ...e, time };
    });
  }, [events]);

  if (loading)
    return (
      <div className="text-white/50 text-center p-8">
        Analyzing emotional patterns...
      </div>
    );
  if (!analysis || (analysis as any).error)
    return (
      <div className="text-red-400 text-center p-8">
        Unable to generate insights.
      </div>
    );

  return (
    <div className="space-y-6 p-4">
      <div className="bg-white/10 border border-white/10 rounded-xl p-6 backdrop-blur-md">
        <h3 className="text-sm uppercase tracking-widest text-white/50 mb-2">
          Emotional Tone
        </h3>
        <p className="text-2xl font-serif text-white">{analysis.tone}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-sm uppercase tracking-widest text-white/50 mb-4">
            Key Themes
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.themes?.map((theme: string, i: number) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-sm"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-sm uppercase tracking-widest text-white/50 mb-4">
            Recurring Questions
          </h3>
          <ul className="space-y-2">
            {analysis.questionsSheRepeated?.map((q: string, i: number) => (
              <li key={i} className="text-white/80 text-sm flex gap-2">
                <span className="text-pink-400">•</span> {q}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-white/10 rounded-xl p-6">
        <h3 className="text-sm uppercase tracking-widest text-white/50 mb-4">
          Guidance for Aravind
        </h3>
        <ul className="space-y-3">
          {analysis.recommendationsForAravind?.map((rec: string, i: number) => (
            <li
              key={i}
              className="text-white/90 flex gap-3 items-start leading-relaxed"
            >
              <span className="text-xl mt-[-2px]">→</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-sm uppercase tracking-widest text-white/50 mb-2">
          Summary
        </h3>
        <p className="text-white/80 leading-relaxed">{analysis.summary}</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm uppercase tracking-widest text-white/50">
            Recent Vivi Activity (no content shared)
          </h3>
          <span className="text-[11px] text-white/40">
            {formattedEvents.length} events
          </span>
        </div>
        {formattedEvents.length === 0 ? (
          <p className="text-white/60 text-sm">No activity recorded yet.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {formattedEvents.map((e) => (
              <div
                key={e.id}
                className="flex justify-between items-start text-sm text-white/80 bg-white/5 border border-white/10 rounded-lg px-3 py-2"
              >
                <div>
                  <div className="font-medium text-white">
                    {e.type.replace(/_/g, " ")}
                  </div>
                  {e.detail && (
                    <div className="text-white/70 text-xs mt-0.5">
                      {e.detail}
                    </div>
                  )}
                  {e.path && (
                    <div className="text-white/40 text-[11px] mt-0.5">
                      {e.path}
                    </div>
                  )}
                </div>
                <div className="text-white/50 text-xs ml-3 whitespace-nowrap">
                  {e.time}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
