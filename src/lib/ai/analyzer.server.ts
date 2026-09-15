import { callVisionModel } from "./gateway.server";
import {
  DESIGN_JSON_CONTRACT,
  designDocumentSchema,
  type DesignDocument,
} from "./design-schema";
import { extractJson } from "./json.server";

const INSTRUCTIONS = `You are a senior frontend engineer performing a forensic visual analysis of a website screenshot.
Your only job in this step is observation: describe the layout, structure and styling you can literally see.
Do not write HTML or CSS. Do not speculate about behaviour. Do not add elements that are not visible.
Work top to bottom: page frame, navbar, hero, content sections, forms, footer.
For every node record layout relationships (flex/grid, direction, alignment, gaps), spacing (padding/margin),
typography (family, size, weight, line height, letter spacing, color), and decoration (background, gradient,
border, radius, shadow). Record images with their observed dimensions and a short alt description.
${DESIGN_JSON_CONTRACT}`;

export async function analyzeScreenshot(imageDataUrl: string): Promise<DesignDocument> {
  const raw = await callVisionModel({
    instructions: INSTRUCTIONS,
    reasoningEffort: "medium",
    content: [
      {
        type: "input_text",
        text: "Analyse this screenshot and return the structured design JSON described in your instructions.",
      },
      { type: "input_image", image_url: imageDataUrl },
    ],
  });

  const parsed = designDocumentSchema.safeParse(extractJson(raw));
  if (!parsed.success) {
    throw new Error("The AI visual analysis did not match the expected design structure.");
  }
  return parsed.data;
}
