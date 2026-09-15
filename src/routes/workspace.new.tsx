import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Check,
  Clipboard,
  Download,
  FileImage,
  Laptop,
  Loader2,
  Monitor,
  RefreshCw,
  Smartphone,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";

import { AppHeader, AppShell } from "@/components/lax/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DesignDocument } from "@/lib/ai/design-schema";
import { analyzeScreenshotFn, generateCodeFn } from "@/lib/conversion.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/workspace/new")({
  head: () => ({
    meta: [
      { title: "New conversion — LAX" },
      { name: "description", content: "Convert a screenshot into semantic HTML and CSS." },
      { property: "og:title", content: "New conversion — LAX" },
      { property: "og:description", content: "Create responsive HTML and CSS from a screenshot." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Workspace,
});

const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/jpg", "image/png"];

type Stage = "idle" | "uploading" | "analyzing" | "generating" | "rendering" | "success" | "error";

const stageCopy: Record<Stage, string> = {
  idle: "Upload a screenshot to begin",
  uploading: "Reading your image…",
  analyzing: "Analysing the design (layout, spacing, typography)…",
  generating: "Writing semantic HTML and CSS…",
  rendering: "Rendering the live preview…",
  success: "Conversion complete",
  error: "Conversion failed",
};

const deviceOptions = [
  { id: "mobile", Icon: Smartphone, width: "375px" },
  { id: "tablet", Icon: Laptop, width: "768px" },
  { id: "desktop", Icon: Monitor, width: "100%" },
] as const;
type DeviceId = (typeof deviceOptions)[number]["id"];

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The image could not be read."));
    reader.readAsDataURL(file);
  });
}

function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function Workspace() {
  const [device, setDevice] = useState<DeviceId>("desktop");
  const [copied, setCopied] = useState<string | null>(null);
  const [file, setFile] = useState<{ name: string; dataUrl: string } | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [design, setDesign] = useState<DesignDocument | null>(null);
  const [code, setCode] = useState<{ html: string; css: string } | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = stage === "uploading" || stage === "analyzing" || stage === "generating" || stage === "rendering";

  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      setError("Copying to the clipboard was blocked by your browser.");
    }
  };

  const pickFile = async (picked: File | undefined) => {
    if (!picked) return;
    setError(null);
    if (!ACCEPTED.includes(picked.type)) {
      setStage("error");
      setError("Only JPG, JPEG and PNG images are supported.");
      return;
    }
    if (picked.size > MAX_BYTES) {
      setStage("error");
      setError("That image is larger than 8 MB. Please upload a smaller screenshot.");
      return;
    }
    setStage("uploading");
    try {
      const dataUrl = await readAsDataUrl(picked);
      setFile({ name: picked.name, dataUrl });
      setCode(null);
      setDesign(null);
      setStage("idle");
    } catch {
      setStage("error");
      setError("The image could not be read. Try another file.");
    }
  };

  const reset = () => {
    setFile(null);
    setCode(null);
    setDesign(null);
    setError(null);
    setStage("idle");
    if (inputRef.current) inputRef.current.value = "";
  };

  const convert = async () => {
    if (!file) {
      setError("Upload a screenshot first.");
      setStage("error");
      return;
    }
    setError(null);
    setCode(null);
    setStage("analyzing");
    try {
      const analysis = await analyzeScreenshotFn({ data: { imageDataUrl: file.dataUrl } });
      if (!analysis.ok) {
        setStage("error");
        setError(analysis.error);
        return;
      }
      setDesign(analysis.design);
      setStage("generating");
      const generated = await generateCodeFn({ data: { design: analysis.design } });
      if (!generated.ok) {
        setStage("error");
        setError(generated.error);
        return;
      }
      setStage("rendering");
      setCode({ html: generated.html, css: generated.css });
      setPreviewKey((key) => key + 1);
      setStage("success");
    } catch {
      setStage("error");
      setError("The conversion request failed. Check your connection and try again.");
    }
  };

  const previewDoc = code
    ? code.html.includes("</head>")
      ? code.html.replace("</head>", `<style>\n${code.css}\n</style>\n</head>`)
      : `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${code.css}</style></head><body>${code.html}</body></html>`
    : "";

  return (
    <AppShell>
      <AppHeader
        eyebrow="New conversion"
        title={file?.name ?? "Untitled frame"}
        action={
          <Button variant="hero" onClick={convert} disabled={busy || !file}>
            {busy ? <Loader2 className="animate-spin" /> : <Upload />}
            {busy ? "Working…" : "Convert screenshot"}
          </Button>
        }
      />

      <div className="mt-6 grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <section className="glass-panel rounded-xl p-5">
            <h2 className="font-display font-semibold">Source</h2>
            <label className="mt-4 grid cursor-pointer place-items-center rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-8 text-center">
              <Upload className="size-6 text-primary" />
              <span className="mt-3 text-sm font-medium">Upload screenshot</span>
              <span className="mt-1 max-w-40 text-xs text-muted-foreground">JPG, JPEG or PNG · max 8 MB</span>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                className="sr-only"
                onChange={(e) => void pickFile(e.target.files?.[0])}
              />
            </label>

            {file ? (
              <div className="mt-3 space-y-3">
                <img
                  src={file.dataUrl}
                  alt={`Preview of ${file.name}`}
                  className="w-full rounded-lg border border-border object-cover"
                />
                <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-xs">
                  <FileImage className="size-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1 truncate">{file.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>
                    Replace
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Remove image" onClick={reset}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="my-5 flex items-center gap-3 text-[10px] uppercase text-muted-foreground">
              <i className="h-px flex-1 bg-border" />
              or
              <i className="h-px flex-1 bg-border" />
            </div>
            <label className="text-xs font-medium">
              Figma frame URL
              <Input className="mt-2 bg-background/40" placeholder="https://figma.com/design/…" disabled />
            </label>
            <p className="mt-2 text-[11px] text-muted-foreground">Figma import is coming next — screenshots are live.</p>
          </section>

          <section className="glass-panel rounded-xl p-5" aria-live="polite">
            <h2 className="font-display font-semibold">Status</h2>
            <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
              {busy ? <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-primary" /> : null}
              {stage === "success" ? <Check className="mt-0.5 size-4 shrink-0 text-primary" /> : null}
              <span>{stageCopy[stage]}</span>
            </p>
            {design ? (
              <p className="mt-3 text-xs text-muted-foreground">
                {design.sections.length} sections detected · page {design.page.width ?? "auto"}
              </p>
            ) : null}
            {error ? (
              <p className="mt-3 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </p>
            ) : null}
          </section>
        </aside>

        <div className="min-w-0 space-y-5">
          <section className="glass-panel rounded-xl p-3">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-2 pb-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">Responsive preview</p>
                <p className="text-xs text-muted-foreground">Isolated sandbox — generated code runs in its own frame</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="flex rounded-lg bg-muted p-1">
                  {deviceOptions.map(({ id, Icon }) => (
                    <Button
                      key={id}
                      variant={device === id ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => setDevice(id)}
                      aria-label={`${id} preview`}
                      title={`${id} preview`}
                    >
                      <Icon />
                    </Button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Refresh preview"
                  title="Refresh preview"
                  disabled={!code}
                  onClick={() => setPreviewKey((key) => key + 1)}
                >
                  <RefreshCw />
                </Button>
              </div>
            </div>
            <div className="grid min-h-[420px] place-items-center overflow-auto p-5">
              {code ? (
                <div
                  className="overflow-hidden rounded-lg border border-preview-line bg-preview-surface shadow-2xl transition-[width] duration-300"
                  style={{ width: deviceOptions.find((d) => d.id === device)?.width }}
                >
                  <iframe
                    key={previewKey}
                    title="Generated page preview"
                    srcDoc={previewDoc}
                    sandbox=""
                    className="h-[560px] w-full bg-white"
                  />
                </div>
              ) : (
                <p className="max-w-sm text-center text-sm text-muted-foreground">{stageCopy[stage]}</p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-code p-3 text-code-foreground">
            <Tabs defaultValue="html">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <TabsList className="justify-start bg-code">
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="css">CSS</TabsTrigger>
                  <TabsTrigger value="design">Design JSON</TabsTrigger>
                </TabsList>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="sm" disabled={!code} onClick={() => code && copy("html", code.html)}>
                    {copied === "html" ? <Check /> : <Clipboard />}
                    <span className="hidden sm:inline">HTML</span>
                  </Button>
                  <Button variant="ghost" size="sm" disabled={!code} onClick={() => code && copy("css", code.css)}>
                    {copied === "css" ? <Check /> : <Clipboard />}
                    <span className="hidden sm:inline">CSS</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!code}
                    onClick={() => code && downloadFile("index.html", code.html, "text/html")}
                  >
                    <Download />
                    <span className="hidden sm:inline">HTML</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!code}
                    onClick={() => code && downloadFile("styles.css", code.css, "text/css")}
                  >
                    <Download />
                    <span className="hidden sm:inline">CSS</span>
                  </Button>
                </div>
              </div>
              <TabsContent value="html">
                <CodeBlock value={code?.html ?? "// Convert a screenshot to see the generated HTML."} />
              </TabsContent>
              <TabsContent value="css">
                <CodeBlock value={code?.css ?? "/* Convert a screenshot to see the generated CSS. */"} />
              </TabsContent>
              <TabsContent value="design">
                <CodeBlock
                  value={design ? JSON.stringify(design, null, 2) : "// The validated design analysis appears here."}
                />
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function CodeBlock({ value }: { value: string }) {
  return (
    <pre className="max-h-80 overflow-auto px-2 py-4 font-mono text-xs leading-6">
      <code>{value}</code>
    </pre>
  );
}
