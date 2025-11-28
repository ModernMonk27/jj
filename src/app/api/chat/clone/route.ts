import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { addMemoryChunk } from '@/lib/rag';
import {
    sanitizeCloneText,
    streamCloneResponse,
} from '@/lib/agents';

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

        // 3. Stream Response
        const anthropicStream = await streamCloneResponse(text, { isFirstReply });
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = new TextEncoder();
        let fullReply = '';

        (async () => {
            try {
                for await (const chunk of anthropicStream as any) {
                    if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
                        // Clean chunk to avoid streaming stage directions to client
                        const cleanChunk = chunk.delta.text.replace(/\*[^*\n]{0,120}\*/g, ' ').replace(/_[^_\n]{0,120}_/g, ' ');
                        fullReply += cleanChunk;
                        await writer.write(encoder.encode(cleanChunk));
                    }
                }
                const cleaned = sanitizeCloneText(fullReply);
                await prisma.cloneMessage.create({
                    data: { senderRole: 'clone', text: cleaned },
                });
                await addMemoryChunk('clone_chat', 'clone', cleaned);
            } catch (streamError) {
                console.error('Clone chat stream error:', streamError);
            } finally {
                await writer.close();
            }
        })();

        return new NextResponse(readable, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
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
