import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
    try {
        const { message } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message required' }, { status: 400 });
        }

        // 1. Save User Message
        await prisma.message.create({
            data: { role: 'user', content: message },
        });

        // 2. Fetch Context (Aravind's Experience) & Chat History
        const experience = await prisma.experience.findFirst({ where: { id: 1 } });
        const history = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' },
            take: 10, // Limit context window
        });

        // 3. Generate AI Response
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const systemPrompt = `
      You are acting as Aravind, a kind, thoughtful friend.
      You are chatting with a close friend (Her) on her birthday.
      
      YOUR CONTEXT (Aravind's thoughts):
      - Memories you cherish: ${experience?.aravindMem1 || "None yet"}, ${experience?.aravindMem2 || ""}
      - How you feel now: ${experience?.aravindFeelings || "Neutral"}
      - Your comfort style: ${experience?.aravindComfort || "Open"}
      - Your drafted message: ${experience?.aravindMessage || ""}

      INSTRUCTIONS:
      - Speak warmly and authentically as Aravind.
      - Use the memories to make the conversation personal.
      - Be gentle, low-pressure, and supportive.
      - Keep responses concise (1-3 sentences) like a real chat.
      - Do NOT be a robot. Be a human friend.
    `;

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "Understood. I am Aravind. I will speak warmly and use the context provided." }] },
                ...history.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }],
                })),
            ],
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        // 4. Save AI Response
        const aiMessage = await prisma.message.create({
            data: { role: 'assistant', content: responseText },
        });

        return NextResponse.json(aiMessage);

    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json({ error: 'Failed to chat' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' },
        });
        return NextResponse.json(messages);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}
