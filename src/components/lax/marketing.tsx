import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu } from "lucide-react";

import { Brand, ThemeToggle } from "./brand";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-glass-border bg-background/75 backdrop-blur-2xl">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 sm:flex sm:justify-between sm:px-6">
        <Brand />
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex" aria-label="Main navigation">
          <Link to="/" className="hover:text-foreground">Product</Link>
          <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
          <a href="/#faq" className="hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" className="hidden sm:inline-flex"><Link to="/login">Sign in</Link></Button>
          <Button asChild variant="hero" className="hidden sm:inline-flex"><Link to="/signup">Get access <ArrowRight /></Link></Button>
          <Button variant="glass" size="icon" className="sm:hidden" aria-label="Open menu"><Menu /></Button>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 sm:grid-cols-[1fr_auto] sm:items-end">
        <div><Brand /><p className="mt-4 max-w-sm text-sm text-muted-foreground">Pixel-perfect interfaces, converted into code your team can own.</p></div>
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground"><Link to="/pricing">Pricing</Link><Link to="/login">Sign in</Link><a href="mailto:hello@lax.dev">Contact</a></div>
      </div>
    </footer>
  );
}

export function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="mx-auto max-w-2xl text-center"><p className="eyebrow">{eyebrow}</p><h1 className="mt-4 font-display text-4xl font-semibold sm:text-6xl">{title}</h1><p className="mt-5 text-lg text-muted-foreground">{description}</p></div>;
}