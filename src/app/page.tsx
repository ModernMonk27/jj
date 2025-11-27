import Link from "next/link";
import QuoteBackground from "@/components/QuoteBackground";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      <QuoteBackground />

      <div className="relative z-10 max-w-md w-full text-center space-y-10 p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="space-y-4">
          <h1 className="text-5xl font-serif tracking-tight text-white drop-shadow-lg">
            For The One Who Changed My Story
          </h1>
          <p className="text-lg text-white/70 font-light tracking-wide">
            A quiet birthday space built for just two people — and all the
            memories between them.
          </p>
        </div>

        {/* Birthday wish + emotional quotes */}
        <div className="space-y-3 text-sm text-white/75">
          <p className="leading-relaxed">
            Happy Birthday, Vivi 🎂 Even if life moved us into different worlds,
            a part of my journey will always whisper a quiet “thank you” to you.
            This isn’t here to ask for anything — it’s just a small corner of
            the internet to honor what you once meant to my life.
          </p>
          <div className="space-y-1 text-xs text-white/60 italic">
            <p>
              “Some people don’t stay in our life, but they stay in our story —
              and that itself is a kind of forever.”
            </p>
            <p>
              “Time can change distance, but it can’t erase the gratitude we
              hold for the ones who helped us become who we are.”
            </p>
            <p>
              “You may never see all the ways you helped me grow, but my path
              quietly remembers your name.”
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
            Just for this moment in time
          </p>
        </div>
      </div>
    </main>
  );
}
