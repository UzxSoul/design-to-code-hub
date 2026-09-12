import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";

export const projects = [
  { id: "atlas-dashboard", name: "Atlas dashboard", source: "Figma", updated: "8 min ago", status: "Ready", tone: "bg-preview-blue" },
  { id: "northstar-pricing", name: "Northstar pricing", source: "Screenshot", updated: "Yesterday", status: "Ready", tone: "bg-preview-mint" },
  { id: "mono-portfolio", name: "Mono portfolio", source: "Figma", updated: "3 days ago", status: "Draft", tone: "bg-preview-violet" },
];

export function ProjectCard({ project }: { project: (typeof projects)[number] }) {
  return <article className="group overflow-hidden rounded-xl border border-glass-border bg-glass shadow-[var(--shadow-glass)] backdrop-blur-xl"><div className={`h-40 p-5 ${project.tone}`}><div className="h-full rounded-lg border border-preview-line bg-preview-surface p-3 shadow-sm"><div className="mb-3 flex gap-1"><i className="size-1.5 rounded-full bg-preview-ink/20"/><i className="size-1.5 rounded-full bg-preview-ink/20"/></div><div className="grid h-20 grid-cols-[.7fr_1fr] gap-2"><div className="rounded bg-preview-ink/10"/><div className="space-y-2"><div className="h-2 w-4/5 rounded bg-preview-ink/20"/><div className="h-2 w-3/5 rounded bg-preview-ink/10"/><div className="h-8 rounded bg-preview-ink/10"/></div></div></div></div><div className="flex items-center justify-between p-4"><div><h3 className="font-display font-semibold">{project.name}</h3><p className="mt-1 text-xs text-muted-foreground">{project.source} · {project.updated}</p></div><Button asChild variant="ghost" size="icon"><Link to="/projects/$projectId" params={{ projectId: project.id }} aria-label={`Open ${project.name}`}><ArrowUpRight /></Link></Button></div></article>;
}

export function EmptyMenuButton() { return <Button variant="ghost" size="icon" aria-label="More options"><MoreHorizontal /></Button>; }