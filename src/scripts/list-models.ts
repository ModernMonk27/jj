import Anthropic from "@anthropic-ai/sdk";

async function main() {
  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || "",
    });

    const res = await client.models.list();
    const ids = res.data.map((m) => m.id);

    console.log("Models available to this API key:");
    ids.forEach((id) => console.log(`- ${id}`));
  } catch (err) {
    console.error("Failed to list models:", err);
    process.exit(1);
  }
}

main();
