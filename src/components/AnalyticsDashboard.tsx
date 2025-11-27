'use client';

import { useState, useEffect } from 'react';

export default function AnalyticsDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/analytics')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="text-white/50 text-center p-8">Analyzing emotional patterns...</div>;
    if (!data || data.error) return <div className="text-red-400 text-center p-8">Unable to generate insights.</div>;

    return (
        <div className="space-y-6 p-4">
            <div className="bg-white/10 border border-white/10 rounded-xl p-6 backdrop-blur-md">
                <h3 className="text-sm uppercase tracking-widest text-white/50 mb-2">Emotional Tone</h3>
                <p className="text-2xl font-serif text-white">{data.tone}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-sm uppercase tracking-widest text-white/50 mb-4">Key Themes</h3>
                    <div className="flex flex-wrap gap-2">
                        {data.themes?.map((theme: string, i: number) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-sm">
                                {theme}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-sm uppercase tracking-widest text-white/50 mb-4">Recurring Questions</h3>
                    <ul className="space-y-2">
                        {data.questionsSheRepeated?.map((q: string, i: number) => (
                            <li key={i} className="text-white/80 text-sm flex gap-2">
                                <span className="text-pink-400">•</span> {q}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm uppercase tracking-widest text-white/50 mb-4">Guidance for Aravind</h3>
                <ul className="space-y-3">
                    {data.recommendationsForAravind?.map((rec: string, i: number) => (
                        <li key={i} className="text-white/90 flex gap-3 items-start">
                            <span className="text-xl mt-[-2px]">💡</span>
                            <span className="leading-relaxed">{rec}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm uppercase tracking-widest text-white/50 mb-2">Summary</h3>
                <p className="text-white/80 leading-relaxed">{data.summary}</p>
            </div>
        </div>
    );
}
