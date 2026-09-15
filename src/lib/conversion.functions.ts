import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { designDocumentSchema, type DesignDocument } from "./ai/design-schema";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png"] as const;

const uploadSchema = z.object({
  imageDataUrl: z
    .string()
    .regex(/^data:image\/(jpeg|jpg|png);base64,[A-Za-z0-9+/=]+$/, "Unsupported image format."),
});

type Result<T> = ({ ok: true } & T) | { ok: false; error: string };

function toMessage(error: unknown): string {
  // Never leak stack traces or provider internals to the browser.
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong while talking to the AI provider.";
}

export const analyzeScreenshotFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => uploadSchema.parse(input))
  .handler(async ({ data }): Promise<Result<{ design: DesignDocument }>> => {
    const base64 = data.imageDataUrl.split(",")[1] ?? "";
    const mime = data.imageDataUrl.slice(5, data.imageDataUrl.indexOf(";"));
    if (!ALLOWED_MIME.includes(mime as (typeof ALLOWED_MIME)[number])) {
      return { ok: false, error: "Only JPG, JPEG and PNG images are supported." };
    }
    if (Math.floor((base64.length * 3) / 4) > MAX_BYTES) {
      return { ok: false, error: "That image is larger than 8 MB. Please upload a smaller screenshot." };
    }

    try {
      const { analyzeScreenshot } = await import("./ai/analyzer.server");
      const design = await analyzeScreenshot(data.imageDataUrl);
      return { ok: true, design };
    } catch (error) {
      console.error(error);
      return { ok: false, error: toMessage(error) };
    }
  });

export const generateCodeFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ design: designDocumentSchema }).parse(input))
  .handler(async ({ data }): Promise<Result<{ html: string; css: string }>> => {
    try {
      const { generateCode } = await import("./ai/codegen.server");
      const { html, css } = await generateCode(data.design);
      return { ok: true, html, css };
    } catch (error) {
      console.error(error);
      return { ok: false, error: toMessage(error) };
    }
  });
