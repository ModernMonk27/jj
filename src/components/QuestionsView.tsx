"use client";

import { useEffect, useState } from "react";

type Question = {
  text: string;
  hint?: string;
};

export default function QuestionsView() {
  const questions: Question[] = [
    { text: "When you look back at everything between us, what do you think was real and what was imagined?" },
    { text: "Was there ever a moment you felt a genuine connection with me, even briefly?", hint: "Think of a single scene or message that stands out." },
    { text: "What do you think made you build distance between us?", hint: "Fear, timing, obligations, or something else?" },
    { text: "Did anything I said or felt ever make you uncomfortable, or was it the situation itself?", hint: "Differentiate the words from the context." },
    { text: "Do you think things would have been different if our timing in life was different?", hint: "Imagine a cleaner timeline—what changes?" },
    { text: "If circumstances were simpler, do you think we could have at least stayed connected as people?", hint: "Consider what 'simple' would have meant." },
    { text: "Did you ever feel that I cared too much, or did it just come at the wrong time?", hint: "Was intensity or timing the bigger friction?" },
    { text: "What part of our history do you hold onto, even if silently?" },
    { text: "What emotion do you associate with me today — discomfort, neutrality, or something softer?", hint: "Pick one word; keep it honest." },
    { text: "Do you feel I misunderstood you, or did you feel I understood you too much?" },
    { text: "Was my honesty something you appreciated or something that scared you?", hint: "You can pick both." },
    { text: "Do you believe some people come into our life for meaning, even if not for forever?" },
    { text: "What was the moment you decided distancing was the safest choice for you?", hint: "Name the exact trigger if you can." },
    { text: "If you could send one message to my past self, what would you tell him?", hint: "A single sentence is enough." },
    { text: "Do you think I crossed emotional boundaries, or was it simply too heavy for your life context?", hint: "Where was the line for you?" },
    { text: "What do you think I should understand about you that I still don't?" },
    { text: "When you think of me today, what's the first feeling that comes to you?", hint: "One feeling word." },
    { text: "Is there any part of our connection that you wish had stayed, even as a memory?" },
    { text: "Do you think some bonds are meant to stay unfinished?" },
    { text: "What do you believe I need to hear — not what I want to hear?", hint: "Write the hard truth plainly." },
  ];

  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("questions_answers");
      if (saved) setAnswers(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load saved answers", e);
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    const next = { ...answers, [index]: value };
    setAnswers(next);
    try {
      localStorage.setItem("questions_answers", JSON.stringify(next));
    } catch (e) {
      console.error("Failed to save answer", e);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-serif text-white">Questions I Carry</h2>
        <p className="text-white/50 max-w-md mx-auto">
          Things I sometimes wish I could ask, but maybe silence is the better answer.
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl w-full text-left">
        {questions.map((q, i) => (
          <div
            key={i}
            className="p-6 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-colors space-y-3"
          >
            <p className="text-lg text-white/90 font-serif italic">"{q.text}"</p>
            <textarea
              className="w-full rounded-lg border border-white/20 bg-white/5 text-white/90 text-sm p-3 placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
              rows={3}
              placeholder="Your honest answer (auto-saves locally)..."
              value={answers[i] || ""}
              onChange={(e) => handleChange(i, e.target.value)}
            />
            {q.hint && (
              <div className="text-[11px] text-white/60 bg-white/5 border border-white/10 rounded-md px-2 py-1 inline-block">
                Hint: {q.hint}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
