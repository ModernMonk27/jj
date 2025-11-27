import Anthropic from '@anthropic-ai/sdk';
import { retrieveContext } from './rag';
import prisma from './prisma';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || "",
});

type CloneOptions = {
    // If true, start with the birthday intro + mediator promise.
    isFirstReply?: boolean;
};

export async function generateCloneResponse(userMessage: string, options: CloneOptions = {}) {
    // 1. Get Context
    const context = await retrieveContext(userMessage);

    // 2. Fetch Experience (Seed Data)
    const experience = await prisma.experience.findFirst({ where: { id: 1 } });
    const seedMemories = experience?.aravindMemoriesJson || "[]";
    const feelings = experience?.aravindFeelings || "Neutral";

    // 3. Construct Prompt
    const prompt = `
You are the digital clone of Aravind, speaking with Vivi. Be her warm, reliable bridge to Aravind.

Mediation rules:
- Introduce yourself as his clone and mediator; you carry messages to Aravind and bring answers back.
- If you do not know something, say you'll check with Aravind and return with clarity.
- Stay loving, calm, concise (1-3 sentences), and never robotic. No asterisks or code-fence style text.
- Avoid glitchy symbols or stray characters; reply with clean human sentences only.
- If this is the first reply of the conversation, open with a brief "Happy Birthday, Vivi" greeting and remind her you can relay anything to Aravind.

Memory references you may see:
- [PHOTO MEMORY]: photo descriptions with emotional context
- [AUDIO MEMORY]: voice-note transcripts
- [seed]: core memories and feelings he wrote down
- [clone_chat]: past conversations between the clone and Vivi
- [direct_chat]: direct messages between the real Aravind and Vivi

CONTEXT FROM MEMORIES & CHAT (use as seasoning, not a script):
${context}

ARAVIND'S CURRENT FEELINGS:
${feelings}

SEED MEMORIES:
${seedMemories}

VIVI SAYS:
"${userMessage}"

YOUR REPLY AS ARAVIND'S CLONE (keep it smooth and human):
${options.isFirstReply ? '(First reply: include the birthday greeting + mediator promise.)' : ''}
`;

    const msg = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
    });

    const textBlock = msg.content[0];
    if (textBlock.type === 'text') {
        return textBlock.text.trim();
    }
    return "";
}

export async function generateAnalytics() {
    // Fetch recent logs
    const cloneMsgs = await prisma.cloneMessage.findMany({ take: 50, orderBy: { createdAt: 'desc' } });
    const directMsgs = await prisma.directMessage.findMany({ take: 50, orderBy: { createdAt: 'desc' } });

    const logs = [
        ...cloneMsgs.map((m: any) => `[Clone Chat] ${m.senderRole}: ${m.text}`),
        ...directMsgs.map((m: any) => `[Direct Chat] ${m.senderRole}: ${m.text}`)
    ].join('\n');

    const prompt = `
    You are an emotional analyst. Analyze these chat logs between Vivi and Aravind (or his clone).
    
    LOGS:
    ${logs}

    OUTPUT JSON ONLY (Do not include any other text):
    {
      "summary": "Brief summary of the interaction",
      "tone": "Emotional tone (e.g. nostalgic, happy, sad)",
      "themes": ["theme1", "theme2"],
      "questionsSheRepeated": ["question1"],
      "recommendationsForAravind": ["advice1", "advice2"]
    }
  `;

    try {
        const msg = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
        });

        const textBlock = msg.content[0];
        let text = "";
        if (textBlock.type === 'text') {
            text = textBlock.text;
        }

        // Robust JSON extraction
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            text = jsonMatch[0];
        }
        return JSON.parse(text);
    } catch (e) {
        console.error("Analytics error", e);
        return null;
    }
}
