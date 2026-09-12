import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { AppHeader, AppShell } from "@/components/lax/app-shell";
import { ProjectCard, projects } from "@/components/lax/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export const Route=createFileRoute("/projects")({head:()=>({meta:[{title:"Projects — LAX"},{name:"description",content:"Browse your LAX conversion projects."},{property:"og:title",content:"Projects — LAX"},{property:"og:description",content:"Browse design-to-code conversion projects."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:Projects});
function Projects(){return <AppShell><AppHeader eyebrow="Library" title="Projects" action={<Button asChild variant="hero"><Link to="/workspace/new"><Plus/>New</Link></Button>}/><div className="relative mt-8 max-w-sm"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input className="h-11 bg-glass pl-9" placeholder="Search projects"/></div><div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{projects.map(p=><ProjectCard key={p.id} project={p}/>)}</div></AppShell>}