import { NextResponse } from 'next/server';
import { generateAnalytics } from '@/lib/agents';

export async function GET(request: Request) {
    try {
        // In a real app, we'd check for ARAVIND_KEY here or in middleware.
        // For now, we assume the frontend handles the key check before calling,
        // or we can check a header if we want to be strict.

        const analytics = await generateAnalytics();

        if (!analytics) {
            return NextResponse.json({ error: 'Failed to generate analytics' }, { status: 500 });
        }

        return NextResponse.json(analytics);
    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
