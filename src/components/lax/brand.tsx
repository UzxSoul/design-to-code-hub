import { Link } from "@tanstack/react-router";
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5" aria-label="LAX home">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-glass-border bg-glass font-display text-sm font-bold text-primary shadow-[var(--shadow-glass)]">Lx</span>
      {!compact && <span className="font-display text-lg font-semibold">LAX</span>}
    </Link>
  );
}

export function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("lax-theme") === "light";
    setLight(saved);
    document.documentElement.classList.toggle("light", saved);
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    window.localStorage.setItem("lax-theme", next ? "light" : "dark");
  };

  return (
    <Button variant="glass" size="icon" onClick={toggle} aria-label={light ? "Use dark theme" : "Use light theme"} title={light ? "Dark theme" : "Light theme"}>
      {light ? <Moon /> : <Sun />}
    </Button>
  );
}

export function DeviceIcon({ active = false }: { active?: boolean }) {
  return <Monitor className={active ? "text-primary" : "text-muted-foreground"} />;
}