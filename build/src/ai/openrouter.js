import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const openrouter = createOpenRouter({
    apiKey: openRouterApiKey,
});
export async function getAIResponse(history, opts) {
    var _a;
    const timeoutMs = (_a = opts === null || opts === void 0 ? void 0 : opts.timeoutMs) !== null && _a !== void 0 ? _a : 60 * 1000; // Default to 1 minute
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const { textStream } = streamText({
            model: openrouter.chat("openai/gpt-oss-20b:free"),
            messages: history,
            abortSignal: controller.signal,
        });
        let fullResponse = "";
        for await (const delta of textStream) {
            fullResponse += delta;
        }
        return fullResponse;
    }
    catch (err) {
        if (err.name === "AbortError")
            throw new Error("AI request timed out");
        throw err;
    }
    finally {
        clearTimeout(id);
    }
}
