// Thin, replaceable wrapper around the AI provider (Lovable AI Gateway, OpenAI
// Responses API shape). Swap this module to change providers.

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/responses";

export const VISION_MODEL = "openai/gpt-6-astra";

export type ResponsesContent =
  | { type: "input_text"; text: string }
  | { type: "input_image"; image_url: string };

export class AiProviderError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "AiProviderError";
  }
}

function userFacingMessage(status: number, body: string): string {
  if (status === 401) return "The AI provider is not configured correctly.";
  if (status === 402) return "The AI credits for this workspace are exhausted. Add credits to continue.";
  if (status === 403) return "AI access is blocked for this workspace by an admin setting.";
  if (status === 429) return "The AI provider is rate limited right now. Try again in a moment.";
  if (status >= 500) return "The AI provider is temporarily unavailable. Try again.";
  return `The AI request was rejected (${status}). ${body.slice(0, 200)}`;
}

/**
 * Sends one prompt (optionally with an image) and returns the model's full text.
 * Streams on the wire — reasoning models routinely run for minutes — but
 * resolves once with the accumulated output.
 */
export async function callVisionModel(options: {
  instructions: string;
  content: ResponsesContent[];
  reasoningEffort?: "low" | "medium" | "high";
  signal?: AbortSignal;
}): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AiProviderError("Missing LOVABLE_API_KEY on the server.", 401);

  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    ...(options.signal ? { signal: options.signal } : {}),
    body: JSON.stringify({
      model: VISION_MODEL,
      stream: true,
      store: false,
      reasoning: { effort: options.reasoningEffort ?? "medium" },
      instructions: options.instructions,
      input: [{ role: "user", content: options.content }],
    }),
  });

  if (!response.ok || !response.body) {
    const body = await response.text().catch(() => "");
    throw new AiProviderError(userFacingMessage(response.status, body), response.status);
  }

  return await readOutputText(response.body);
}

async function readOutputText(body: ReadableStream<Uint8Array>): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const event = JSON.parse(payload) as {
          type?: string;
          delta?: string;
          response?: { output_text?: string };
        };
        if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
          text += event.delta;
        } else if (event.type === "response.completed" && !text) {
          text = event.response?.output_text ?? "";
        }
      } catch {
        // ignore keep-alives and partial frames
      }
    }
  }

  if (!text.trim()) throw new AiProviderError("The AI returned an empty response.");
  return text;
}
