import { z } from "zod";

// Strict, predictable representation of what the AI can actually see in a
// screenshot. Shared by the analyzer (output contract) and the code generator
// (input contract), and validated between the two steps.

const boxSchema = z
  .object({
    top: z.string().optional(),
    right: z.string().optional(),
    bottom: z.string().optional(),
    left: z.string().optional(),
  })
  .partial();

const typographySchema = z
  .object({
    fontFamily: z.string().optional(),
    fontSize: z.string().optional(),
    fontWeight: z.union([z.string(), z.number()]).optional(),
    lineHeight: z.string().optional(),
    letterSpacing: z.string().optional(),
    textAlign: z.string().optional(),
    textTransform: z.string().optional(),
    color: z.string().optional(),
  })
  .partial();

const layoutSchema = z
  .object({
    display: z.string().optional(),
    flexDirection: z.string().optional(),
    gridTemplateColumns: z.string().optional(),
    justifyContent: z.string().optional(),
    alignItems: z.string().optional(),
    gap: z.string().optional(),
    width: z.string().optional(),
    maxWidth: z.string().optional(),
    height: z.string().optional(),
    padding: boxSchema.optional(),
    margin: boxSchema.optional(),
  })
  .partial();

const styleSchema = z
  .object({
    background: z.string().optional(),
    gradient: z.string().optional(),
    border: z.string().optional(),
    borderRadius: z.string().optional(),
    boxShadow: z.string().optional(),
    opacity: z.number().optional(),
  })
  .partial();

export type DesignNode = {
  type: string;
  role?: string;
  className: string;
  text?: string;
  tag?: string;
  layout?: z.infer<typeof layoutSchema>;
  style?: z.infer<typeof styleSchema>;
  typography?: z.infer<typeof typographySchema>;
  image?: { alt?: string; width?: string; height?: string; objectFit?: string; placeholder?: boolean };
  children?: DesignNode[];
};

export const designNodeSchema: z.ZodType<DesignNode> = z.lazy(() =>
  z.object({
    type: z.string().min(1),
    role: z.string().optional(),
    className: z.string().min(1),
    text: z.string().optional(),
    tag: z.string().optional(),
    layout: layoutSchema.optional(),
    style: styleSchema.optional(),
    typography: typographySchema.optional(),
    image: z
      .object({
        alt: z.string().optional(),
        width: z.string().optional(),
        height: z.string().optional(),
        objectFit: z.string().optional(),
        placeholder: z.boolean().optional(),
      })
      .optional(),
    children: z.array(designNodeSchema).optional(),
  }),
);

export const designDocumentSchema = z.object({
  page: z.object({
    width: z.string().optional(),
    height: z.string().optional(),
    background: z.string().optional(),
    baseFontFamily: z.string().optional(),
    baseFontSize: z.string().optional(),
    textColor: z.string().optional(),
    colorPalette: z.array(z.string()).optional(),
    responsiveClues: z.array(z.string()).optional(),
  }),
  sections: z.array(designNodeSchema).min(1),
});

export type DesignDocument = z.infer<typeof designDocumentSchema>;

// Human-readable contract handed to the model. Kept next to the schema so the
// two never drift apart.
export const DESIGN_JSON_CONTRACT = `Return ONLY a JSON object (no prose, no markdown fences) with this exact shape:
{
  "page": {
    "width": "e.g. 1440px",
    "height": "e.g. 3200px",
    "background": "css color or gradient",
    "baseFontFamily": "css font stack",
    "baseFontSize": "e.g. 16px",
    "textColor": "css color",
    "colorPalette": ["#hex", "..."],
    "responsiveClues": ["short observations about how the layout should adapt"]
  },
  "sections": [
    {
      "type": "navbar | hero | section | footer | form | ...",
      "role": "optional semantic hint",
      "tag": "header | nav | main | section | footer | div | ul | form | ...",
      "className": "kebab-case meaningful class name",
      "text": "visible text if this node is a text node",
      "layout": { "display": "flex|grid|block", "flexDirection": "row|column", "gridTemplateColumns": "...", "justifyContent": "...", "alignItems": "...", "gap": "24px", "width": "...", "maxWidth": "1200px", "height": "...", "padding": { "top": "24px", "right": "24px", "bottom": "24px", "left": "24px" }, "margin": { "top": "0" } },
      "style": { "background": "...", "gradient": "...", "border": "1px solid #e5e7eb", "borderRadius": "12px", "boxShadow": "0 1px 2px rgba(0,0,0,.06)", "opacity": 1 },
      "typography": { "fontFamily": "...", "fontSize": "18px", "fontWeight": 600, "lineHeight": "1.5", "letterSpacing": "-0.01em", "textAlign": "left", "textTransform": "none", "color": "#111827" },
      "image": { "alt": "what the image shows", "width": "640px", "height": "360px", "objectFit": "cover", "placeholder": true },
      "children": [ ...same node shape, nested as deeply as the design requires... ]
    }
  ]
}
Rules: omit any property you cannot observe; never invent elements, text, or images that are not visible; measure spacing, sizes and colors as accurately as you can from the pixels; keep class names meaningful and unique.`;
