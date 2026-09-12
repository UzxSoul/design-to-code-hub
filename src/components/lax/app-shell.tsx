import { Link, useRouterState } from "@tanstack/react-router";
import { FolderKanban, Gauge, LogOut, Plus, Settings, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { Brand, ThemeToggle } from "./brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard" as const, label: "Overview", icon: Gauge },
  { to: "/projects" as const, label: "Projects", icon: FolderKanban },
  { to: "/settings" as const, label: "Settings", icon: Settings },
  { to: "/admin" as const, label: "Admin", icon: ShieldCheck },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-sidebar/90 p-4 backdrop-blur-2xl lg:flex lg:flex-col">
        <div className="px-2 py-2"><Brand /></div>
        <Button asChild variant="hero" className="mt-6 w-full"><Link to="/workspace/new"><Plus /> New conversion</Link></Button>
        <nav className="mt-7 space-y-1" aria-label="Workspace navigation">
          {items.map(({ to, label, icon: Icon }) => <Link key={to} to={to} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground", path.startsWith(to) && "bg-accent text-foreground")}><Icon className="size-4" />{label}</Link>)}
        </nav>
        <div className="mt-auto rounded-xl border border-glass-border bg-glass p-3 shadow-[var(--shadow-glass)]"><p className="text-xs text-muted-foreground">Workspace</p><p className="mt-1 truncate text-sm font-medium">Alex’s studio</p><Button variant="ghost" size="sm" className="mt-2"><LogOut className="size-3.5" /> Sign out</Button></div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border bg-background/75 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex min-w-0 items-center gap-3 lg:hidden"><Brand compact /><span className="truncate font-display font-semibold">LAX Studio</span></div>
          <div className="hidden min-w-0 lg:block"><p className="truncate text-sm text-muted-foreground">Turn pixels into production</p></div>
          <div className="flex shrink-0 items-center gap-2"><ThemeToggle /><div className="grid size-9 place-items-center rounded-full bg-primary font-display text-xs font-semibold text-primary-foreground">AK</div></div>
        </header>
        <main className="p-5 sm:p-8">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-background/90 p-2 backdrop-blur-xl lg:hidden">
          {items.map(({ to, label, icon: Icon }) => <Link key={to} to={to} className={cn("flex flex-col items-center gap-1 rounded-md py-2 text-[10px] text-muted-foreground", path.startsWith(to) && "bg-accent text-foreground")}><Icon className="size-4" />{label}</Link>)}
        </nav>
      </div>
    </div>
  );
}

export function AppHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4"><div className="min-w-0"><p className="eyebrow">{eyebrow}</p><h1 className="mt-2 truncate font-display text-3xl font-semibold sm:text-4xl">{title}</h1></div>{action}</div>;
}