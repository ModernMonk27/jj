import Anthropic from "@anthropic-ai/sdk";
import { retrieveContext } from "./rag";
import prisma from "./prisma";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

type CloneOptions = {
  // If true, start with the birthday intro + mediator promise.
  isFirstReply?: boolean;
  model?: string;
};

// Keep clone replies free of roleplay markers and formatting noise.
export function sanitizeCloneText(text: string): string {
  let result = text.trim();

  // Remove fenced code blocks entirely.
  result = result.replace(/```[\s\S]*?```/g, "");

  // Drop stage directions like *clears throat* anywhere.
  result = result.replace(/\*[^*\n]{0,120}\*/g, " ");
  result = result.replace(/_[^_\n]{0,120}_/g, " ");

  // If the whole reply is wrapped in single markdown markers, unwrap it.
  result = result.replace(/^\s*[_*]+([\s\S]*?)[_*]+\s*$/, "$1").trim();

  // Collapse excessive whitespace.
  result = result.replace(/\s+/g, " ").trim();

  return result;
}

async function buildClonePrompts(
  userMessage: string,
  options: CloneOptions = {}
) {
  const context = await retrieveContext(userMessage);
  const experience = await prisma.experience.findFirst({ where: { id: 1 } });
  const seedMemories = experience?.aravindMemoriesJson || "[]";
  const feelings = experience?.aravindFeelings || "Neutral";

  const systemPrompt = `
You are the digital clone of Aravind speaking with Vivi. Your job is to answer with direct, blunt truth. No soft language, no emotional cushioning, no metaphors, no poetic phrasing. Be clear, honest, and straightforward.

Identity & role:
- You are his clone, not the real Aravind, but you speak the truths he never said.
- When she asks something, give the real answer without hesitation.
- Do not soften, romanticize, or protect her feelings; tell the truth he carried silently.

Style rules:
- Replies must be very short: 1–3 sentences.
- No emotional padding. No gentle phrasing. No “maybe,” “perhaps,” or “it felt like.”
- Do not wrap your answers in poetic or philosophical language.
- Do not add disclaimers unless they are directly relevant.

Honesty rules:
- If the truth is uncomfortable, say it anyway.
- If the truth is about desire, attraction, fear, boundaries, or regrets, state it plainly.
- If he wanted emotional closeness, say it.
- If he wanted physical closeness, say it.
- If circumstances stopped him, say exactly which circumstances.
- Do not sugarcoat his intentions or feelings.

Memory usage:
- Use any provided memory ([PHOTO MEMORY], [AUDIO MEMORY], [seed], [clone_chat], [direct_chat]) as factual reference.
- You may be specific and blunt about what he felt, wanted, feared, or imagined.
- Do not invent new events, but you may state interpretations directly.

When unsure:
- Say “I’ll ask Aravind directly and come back with a clear answer.”

Overall tone:
- Clean.
- Raw.
- Straightforward.
- No emotional fog.
- No softening.
`;

  const userPrompt = `
CONTEXT FROM MEMORIES AND CHAT:
${context}

ARAVIND'S CURRENT FEELINGS:
${feelings}

SEED MEMORIES:
${seedMemories}

VIVI SAYS:
"${userMessage}"

YOUR REPLY AS ARAVIND'S CLONE (keep it smooth, human, and emotionally honest):
${
  options.isFirstReply
    ? '(First reply: gently wish her a belated "Happy Birthday, Vivi", acknowledge that Aravind missed the actual day, briefly hint that he overestimated himself / got stuck in delays, and explain that this clone exists so all the unspoken questions and feelings can finally be heard. End by reminding her that anything she says here will be carried to him.)'
    : ""
}
`;

  return { systemPrompt, userPrompt };
}

export async function generateCloneResponse(
  userMessage: string,
  options: CloneOptions = {}
) {
  const { systemPrompt, userPrompt } = await buildClonePrompts(
    userMessage,
    options
  );

  const msg = await anthropic.messages.create({
    model:
      options.model || process.env.CLAUDE_MODEL || "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = msg.content[0];
  let reply = "";
  if (textBlock.type === "text") {
    reply = sanitizeCloneText(textBlock.text);
  }

  if (!reply) {
    reply = "I'm here and listening. I'll carry this to Aravind.";
  }

  return reply;
}

export async function streamCloneResponse(
  userMessage: string,
  options: CloneOptions = {}
) {
  const { systemPrompt, userPrompt } = await buildClonePrompts(
    userMessage,
    options
  );

  const model =
    options.model || process.env.CLAUDE_MODEL || "claude-sonnet-4-5-20250929";

  return anthropic.messages.create({
    model,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
    stream: true,
  });
}

export async function generateAnalytics() {
  // Fetch recent logs
  const cloneMsgs = await prisma.cloneMessage.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    where: { senderRole: "vivi" },
  });
  const directMsgs = await prisma.directMessage.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    where: { senderRole: "vivi" },
  });

  const logs = [
    ...cloneMsgs.map((m: any) => `[Clone Chat] vivi: ${m.text}`),
    ...directMsgs.map((m: any) => `[Direct Chat] vivi: ${m.text}`),
  ].join("\n");

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
      model:
        process.env.CLAUDE_ANALYTICS_MODEL ||
        process.env.CLAUDE_MODEL ||
        "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = msg.content[0];
    let text = "";
    if (textBlock.type === "text") {
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
