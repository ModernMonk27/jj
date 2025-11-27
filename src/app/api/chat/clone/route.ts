import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateCloneResponse } from '@/lib/agents';
import { addMemoryChunk } from '@/lib/rag';

export async function POST(request: Request) {
    try {
        const { text } = await request.json();

        if (!text) return NextResponse.json({ error: 'Text required' }, { status: 400 });

        // Check if this is the first ever clone reply (used for intro tone)
        const cloneReplyCount = await prisma.cloneMessage.count({ where: { senderRole: 'clone' } });
        const isFirstReply = cloneReplyCount === 0;

        // 1. Save User Message
        await prisma.cloneMessage.create({
            data: { senderRole: 'vivi', text },
        });

        // 2. Add to Memory
        await addMemoryChunk('clone_chat', 'vivi', text);

        // 3. Generate Response
        const replyText = await generateCloneResponse(text, { isFirstReply });

        // 4. Save Response
        const replyMsg = await prisma.cloneMessage.create({
            data: { senderRole: 'clone', text: replyText },
        });

        // 5. Add to Memory
        await addMemoryChunk('clone_chat', 'clone', replyText);

        return NextResponse.json(replyMsg);
    } catch (error) {
        console.error('Clone chat error:', error);
        return NextResponse.json({ error: 'Failed to chat' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const messages = await prisma.cloneMessage.findMany({
            orderBy: { createdAt: 'asc' },
        });
        return NextResponse.json(messages);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}
