import { z } from "zod";

import { callVisionModel } from "./gateway.server";
import type { DesignDocument } from "./design-schema";
import { extractJson } from "./json.server";

const codeSchema = z.object({
  html: z.string().min(20),
  css: z.string().min(20),
});

export type GeneratedCode = z.infer<typeof codeSchema>;

const INSTRUCTIONS = `You convert a validated design JSON document into production-quality HTML and CSS.
Requirements:
- semantic HTML5 (header, nav, main, section, article, footer, ul/li, button, form elements)
- HTML and CSS strictly separated; the HTML links to "styles.css" in its head
- meaningful, kebab-case class names taken from the design JSON
- Flexbox or Grid for layout; avoid absolute positioning unless the design clearly requires it
- reproduce spacing, colors, typography, borders, radii, shadows and gradients from the JSON accurately
- responsive: sensible max-widths plus media queries for tablet and mobile
- no CSS frameworks, no JavaScript, no animations, no inline styles (except a required image placeholder size)
- images use descriptive alt text and a neutral placeholder source
- readable, maintainable, no dead CSS rules
Return ONLY a JSON object: {"html": "<!DOCTYPE html>...", "css": "..."} with real newlines escaped as \\n.`;

export async function generateCode(design: DesignDocument): Promise<GeneratedCode> {
  const raw = await callVisionModel({
    instructions: INSTRUCTIONS,
    reasoningEffort: "medium",
    content: [
      {
        type: "input_text",
        text: `Design JSON:\n${JSON.stringify(design)}\n\nReturn the JSON object with the html and css strings.`,
      },
    ],
  });

  const parsed = codeSchema.safeParse(extractJson(raw));
  if (!parsed.success) throw new Error("The AI did not return usable HTML and CSS.");
  return parsed.data;
}
