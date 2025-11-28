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
        const memoriesJson = JSON.stringify({
            mem1: data.aravindMem1 || "",
            mem2: data.aravindMem2 || "",
            message: data.aravindMessage || "",
            comfort: data.aravindComfort || [],
        });

        const experience = await prisma.experience.upsert({
            where: { id: 1 },
            update: {
                aravindMemoriesJson: memoriesJson,
                aravindFeelings: data.aravindFeelings,
            },
            create: {
                id: 1,
                aravindMemoriesJson: memoriesJson,
                aravindFeelings: data.aravindFeelings,
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
