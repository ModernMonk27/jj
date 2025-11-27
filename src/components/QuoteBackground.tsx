'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const quotes = [
    "Some people stay in your life. Some stay in your story. You’re both.",
    "Time passed, but the warmth of certain memories didn’t.",
    "Not every silence means distance; some bonds just go quiet for a while.",
    "Today is your day, but a small part of my timeline too.",
    "Distance is just a test to see how far love can travel.",
    "Memories are the only paradise we can't be driven out of.",
];

export default function QuoteBackground() {
    const [currentQuote, setCurrentQuote] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuote((prev) => (prev + 1) % quotes.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#4c0519] opacity-90" />

            {/* Floating Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

            {/* Quote */}
            <div className="absolute inset-0 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={currentQuote}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 0.15, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 2 }}
                        className="text-4xl md:text-6xl font-serif text-white text-center max-w-4xl px-4 leading-tight"
                    >
                        {quotes[currentQuote]}
                    </motion.p>
                </AnimatePresence>
            </div>
        </div>
    );
}
