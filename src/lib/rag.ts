import prisma from '@/lib/prisma';
import { MemoryChunk } from '@prisma/client';

export async function addMemoryChunk(source: string, role: string, content: string) {
    try {
        await prisma.memoryChunk.create({
            data: {
                source,
                role,
                content,
            },
        });
    } catch (error) {
        console.error('Error adding memory chunk:', error);
    }
}

export async function retrieveContext(query: string, limit: number = 5): Promise<string> {
    // In a real production app, we would use vector embeddings here.
    // For this personal app without pgvector setup, we will fetch recent chunks
    // and maybe do some basic keyword filtering if needed.
    // For now, we'll return the most recent relevant chunks.

    try {
        // 1. Fetch recent chunks
        const chunks = await prisma.memoryChunk.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20, // Fetch more to filter
        });

        // 2. Simple keyword matching (very basic)
        const keywords = query.toLowerCase().split(' ').filter(w => w.length > 3);

        const relevantChunks = chunks.filter(chunk => {
            const content = chunk.content.toLowerCase();
            // Always include seed memories
            if (chunk.source === 'seed') return true;
            // Include if matches keywords ...
            return keywords.some(k => content.includes(k));
        }).slice(0, limit);

        // If no relevant chunks found, just return the most recent ones
        const finalChunks = relevantChunks.length > 0 ? relevantChunks : chunks.slice(0, limit);

        return finalChunks.map(c => {
            let prefix = `[${c.source}]`;
            if (c.source === 'photo') prefix = '[PHOTO MEMORY]';
            if (c.source === 'audio') prefix = '[AUDIO MEMORY]';

            // For chats, we want to keep the role
            if (c.source.includes('chat')) {
                return `${prefix} ${c.role}: ${c.content}`;
            }
            return `${prefix}: ${c.content}`;
        }).join('\n');
    } catch (error) {
        console.error('Error retrieving context:', error);
        return "";
    }
}
