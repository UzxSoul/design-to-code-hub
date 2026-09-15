// Model output is text; extract the JSON payload defensively.

export function extractJson(raw: string): unknown {
  const withoutFences = raw
    .replace(/^\s*```(?:json)?/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const start = withoutFences.search(/[[{]/);
  if (start === -1) throw new Error("The AI response did not contain any JSON.");

  const opening = withoutFences[start];
  const closing = opening === "{" ? "}" : "]";
  const end = withoutFences.lastIndexOf(closing);
  const candidate = withoutFences.slice(start, end === -1 ? undefined : end + 1);

  try {
    return JSON.parse(candidate);
  } catch {
    throw new Error("The AI response was not valid JSON.");
  }
}
