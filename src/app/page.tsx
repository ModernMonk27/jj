import Link from "next/link";
import QuoteBackground from "@/components/QuoteBackground";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      <QuoteBackground />

      <div className="relative z-10 max-w-md w-full text-center space-y-10 p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-white drop-shadow-lg">
            For The Birthday I Missed
          </h1>
          <p className="text-lg text-white/70 font-light tracking-wide">
            A belated wish, a rebuilt space, and all the words I never managed
            to say on time.
          </p>
        </div>

        {/* Belated birthday + feelings + clone context */}
        <div className="space-y-4 text-sm text-white/80">
          <p className="leading-relaxed">
            I wanted to build this for you in one day and send it on your
            birthday. I was overconfident, ran into issues, and missed the
            moment — just like so many other times in my life where delay and
            overthinking came in between what I felt and what I actually did.
          </p>
          <p className="leading-relaxed">
            This is my belated wish to you, Vivi. Not to pull you back into
            anything, but to be honest about how much you once meant to my
            journey. I rebuilt this space so you can see, if you ever choose to,
            the part of me that never knew how to show up on time, but always
            cared for real.
          </p>
          <p className="leading-relaxed text-white/75">
            Inside, there’s a gentle “clone” of me — made from my memories,
            messages, and the thoughts I could never say out loud. It exists so
            that the questions I couldn’t answer directly, and the questions you
            might never feel comfortable asking me, can still be voiced and
            gently heard in a safe middle space. You don’t owe this place
            anything. It’s just my way of saying:
            <span className="block mt-1 font-medium text-white">
              “I was late. But my feelings, gratitude, and truth were real.”
            </span>
          </p>

          <div className="space-y-1 text-xs text-white/60 italic">
            <p>
              “Some wishes don’t arrive on the right day, but they can still be
              sincere when they finally reach you.”
            </p>
            <p>
              “Timing was never my strength, but what I felt because of you
              shaped the person I became.”
            </p>
            <p>
              “This is not to ask for anything back — only to let the unspoken
              parts of my heart stand still for a moment, in front of you.”
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-2">
          <Link
            href="/experience?role=aravind"
            className="group w-full py-4 px-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
          >
            <span className="text-xl">🌙</span>
            <span className="text-lg font-medium text-white/90 group-hover:text-white">
              I’m Aravind
            </span>
          </Link>

          <Link
            href="/experience?role=vivi"
            className="group w-full py-4 px-6 bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-white/20 rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
          >
            <span className="text-xl">🎂</span>
            <span className="text-lg font-medium text-white/90 group-hover:text-white">
              I’m Vivi
            </span>
          </Link>
        </div>

        <div className="pt-6 border-t border-white/10">
          <p className="text-xs text-white/30 uppercase tracking-widest">
            A late wish, but an honest one
          </p>
        </div>
      </div>
    </main>
  );
}
