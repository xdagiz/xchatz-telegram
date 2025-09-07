import { streamText, type ModelMessage } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openRouterApiKey = process.env.OPENROUTER_API_KEY!;

const openrouter = createOpenRouter({
  apiKey: openRouterApiKey,
});

const freeModels = [
  "openrouter/sonoma-dusk-alpha",
  "openrouter/sonoma-sky-alpha",
  "deepseek/deepseek-chat-v3.1:free",
  "openai/gpt-oss-120b:free",
  "openai/gpt-oss-20b:free",
  "z-ai/glm-4.5-air:free",
  "qwen/qwen3-coder:free",
  "moonshotai/kimi-k2:free",
  "google/gemma-3n-e2b-it:free",
  "tngtech/deepseek-r1t2-chimera:free",
  "mistralai/mistral-small-3.2-24b-instruct:free",
  "google/gemini-2.5-pro-exp-03-25",
  "google/gemini-2.0-flash-exp:free",
];

const selectedModel = process.env.AI_MODEL ?? freeModels[2];

export async function getAIResponse(
  history: ModelMessage[],
  opts?: { timeoutMs: number; model: string },
): Promise<string> {
  const timeoutMs = opts?.timeoutMs ?? 60 * 1000; // Default to 1 minute
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const { textStream } = streamText({
      model: openrouter.chat(selectedModel),
      messages: history,
      abortSignal: controller.signal,
    });

    let fullResponse = "";
    for await (const delta of textStream) {
      fullResponse += delta;
    }

    return fullResponse;
  } catch (err: any) {
    if ((err as any).name === "AbortError")
      throw new Error("AI request timed out");
    throw err;
  } finally {
    clearTimeout(id);
  }
}
