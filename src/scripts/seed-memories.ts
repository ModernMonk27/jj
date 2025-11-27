import { PrismaClient } from '@prisma/client';
import { photoMemories, audioMemories, seedMemories } from './memory-data';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding memories...');

    // 1. Photo Memories
    for (const mem of photoMemories) {
        await prisma.memoryChunk.create({
            data: { source: 'photo', role: mem.role, content: mem.content },
        });
    }

    // 2. Audio Memories
    for (const mem of audioMemories) {
        await prisma.memoryChunk.create({
            data: { source: 'audio', role: mem.role, content: mem.content },
        });
    }

    // 3. Seed (Text) Memories
    for (const mem of seedMemories) {
        await prisma.memoryChunk.create({
            data: { source: 'seed', role: mem.role, content: mem.content },
        });
    }

    console.log('✅ Memories seeded successfully!');
}

main()
    .catch((e) => {
        console.error('Error seeding memories:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
