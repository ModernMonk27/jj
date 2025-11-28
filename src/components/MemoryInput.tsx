'use client';

import { useState, useEffect } from 'react';
import { Experience } from '@prisma/client';

interface MemoryInputProps {
    experience: Experience;
}

export default function MemoryInput({ experience }: MemoryInputProps) {
    const [formData, setFormData] = useState<any>({
        aravindMem1: '',
        aravindMem2: '',
        aravindFeelings: '',
        aravindComfort: [],
        aravindMessage: '',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let parsedMemories: any = {};
        try {
            parsedMemories = experience.aravindMemoriesJson
                ? JSON.parse(experience.aravindMemoriesJson)
                : {};
        } catch (e) {
            parsedMemories = {};
        }

        setFormData({
            aravindMem1: parsedMemories.mem1 || '',
            aravindMem2: parsedMemories.mem2 || '',
            aravindFeelings: experience.aravindFeelings || '',
            aravindComfort: parsedMemories.comfort || [],
            aravindMessage: parsedMemories.message || '',
        });
    }, [experience]);

    const handleChange = async (field: string, value: any) => {
        const newData = { ...formData, [field]: value };
        setFormData(newData);

        // Auto-save (debounced in a real app, but direct here for simplicity)
        setSaving(true);
        try {
            await fetch('/api/experience/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'aravind', data: newData }),
            });
        } catch (error) {
            console.error('Auto-save failed', error);
        } finally {
            setSaving(false);
        }
    };

    const handleComfortToggle = (option: string) => {
        const current = formData.aravindComfort || [];
        const updated = current.includes(option)
            ? current.filter((item: string) => item !== option)
            : [...current, option];
        handleChange('aravindComfort', updated);
    };

    const comfortOptions = ["short calm texts", "sharing songs / playlists", "light memes / fun stuff", "maybe meet someday (no rush)"];

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-10 pb-20">
            <header className="space-y-2">
                <h1 className="text-3xl font-serif text-stone-900">Memory Feed</h1>
                <p className="text-stone-500">
                    Feed the AI with your memories and feelings. It will use this to chat with her as you.
                </p>
            </header>

            <div className="space-y-6">
                <section className="space-y-3">
                    <h2 className="text-sm font-medium text-stone-400 uppercase tracking-wider">Core Memories</h2>
                    <textarea
                        className="w-full p-4 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-stone-900 focus:outline-none transition-all resize-none shadow-sm"
                        rows={3}
                        placeholder="Memory 1: A specific moment you cherish..."
                        value={formData.aravindMem1}
                        onChange={(e) => handleChange('aravindMem1', e.target.value)}
                    />
                    <textarea
                        className="w-full p-4 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-stone-900 focus:outline-none transition-all resize-none shadow-sm"
                        rows={3}
                        placeholder="Memory 2: Another small detail..."
                        value={formData.aravindMem2}
                        onChange={(e) => handleChange('aravindMem2', e.target.value)}
                    />
                </section>

                <section className="space-y-3">
                    <h2 className="text-sm font-medium text-stone-400 uppercase tracking-wider">Current Vibe</h2>
                    <textarea
                        className="w-full p-4 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-stone-900 focus:outline-none transition-all resize-none shadow-sm"
                        rows={3}
                        placeholder="How do you feel right now?"
                        value={formData.aravindFeelings}
                        onChange={(e) => handleChange('aravindFeelings', e.target.value)}
                    />
                </section>

                <section className="space-y-3">
                    <h2 className="text-sm font-medium text-stone-400 uppercase tracking-wider">Comfort Style</h2>
                    <div className="flex flex-wrap gap-2">
                        {comfortOptions.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleComfortToggle(option)}
                                className={`px-4 py-2 rounded-full text-sm transition-all border ${formData.aravindComfort?.includes(option)
                                        ? 'bg-stone-900 text-white border-stone-900'
                                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-sm font-medium text-stone-400 uppercase tracking-wider">Draft Message (Context)</h2>
                    <textarea
                        className="w-full p-4 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-stone-900 focus:outline-none transition-all resize-none shadow-sm"
                        rows={5}
                        placeholder="Write a draft message. The AI will use this as a base for its tone."
                        value={formData.aravindMessage}
                        onChange={(e) => handleChange('aravindMessage', e.target.value)}
                    />
                </section>
            </div>

            <div className="fixed bottom-6 right-6">
                <div className={`px-4 py-2 rounded-full bg-stone-900 text-white text-sm shadow-lg transition-opacity ${saving ? 'opacity-100' : 'opacity-0'}`}>
                    Saving...
                </div>
            </div>
        </div>
    );
}
