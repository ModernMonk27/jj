import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { role, data } = body;

        if (role !== 'aravind') {
            return NextResponse.json(
                { error: 'Only Aravind can update experience data now.' },
                { status: 403 }
            );
        }

        // Update experience
        const experience = await prisma.experience.upsert({
            where: { id: 1 },
            update: {
                aravindMem1: data.aravindMem1,
                aravindMem2: data.aravindMem2,
                aravindFeelings: data.aravindFeelings,
                aravindComfort: JSON.stringify(data.aravindComfort || []),
                aravindMessage: data.aravindMessage,
            },
            create: {
                id: 1,
                aravindMem1: data.aravindMem1,
                aravindMem2: data.aravindMem2,
                aravindFeelings: data.aravindFeelings,
                aravindComfort: JSON.stringify(data.aravindComfort || []),
                aravindMessage: data.aravindMessage,
            },
        });

        return NextResponse.json(experience);
    } catch (error) {
        console.error('Error updating experience:', error);
        return NextResponse.json(
            { error: 'Failed to update experience' },
            { status: 500 }
        );
    }
}
