import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { addMemoryChunk } from '@/lib/rag';

export async function POST(request: Request) {
    try {
        const { text, senderRole } = await request.json();

        if (!text || !senderRole) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        // 1. Save Message
        const msg = await prisma.directMessage.create({
            data: { senderRole, text },
        });

        // 2. Add to Memory (so the clone knows what's happening in real life too)
        await addMemoryChunk('direct_chat', senderRole, text);

        return NextResponse.json(msg);
    } catch (error) {
        console.error('Direct chat error:', error);
        return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const messages = await prisma.directMessage.findMany({
            orderBy: { createdAt: 'asc' },
        });
        return NextResponse.json(messages);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}
