import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        let experience = await prisma.experience.findFirst({
            where: { id: 1 },
        });

        if (!experience) {
            experience = await prisma.experience.create({
                data: {
                    id: 1,
                },
            });
        }

        return NextResponse.json(experience);
    } catch (error) {
        console.error('Error fetching experience:', error);
        return NextResponse.json(
            { error: 'Failed to fetch experience' },
            { status: 500 }
        );
    }
}
