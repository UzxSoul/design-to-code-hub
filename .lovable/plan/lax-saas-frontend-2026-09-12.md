# LAX SaaS frontend

## Scope
Build a complete, responsive frontend for LAX using the selected frosted depth-stack direction. All product actions use realistic local demo states only; no AI generation backend will be added.

## Pages
- Landing page with navigation, product-led hero, screenshot-to-code demonstration, workflow, features, Figma integration, pricing preview, FAQ, and footer
- Pricing, login, and signup pages
- Shared authenticated app shell with dashboard, projects, project detail, settings, and admin placeholder
- New conversion workspace with screenshot upload, Figma URL entry, preview, HTML/CSS/assets tabs, copy/download actions, and desktop/tablet/mobile controls

## Shared experience
- Reusable navigation, footer, buttons, panels, app sidebar, project cards, pricing cards, and code/preview controls
- Dark theme by default plus a persistent light-theme switch
- Accessible labels, keyboard focus states, semantic structure, responsive navigation, and reduced-motion support
- Route-specific page titles and social metadata

## Technical details
- Keep TanStack Start routing and create a dedicated route for every requested page
- Centralize the selected Space Grotesk, Inter, and JetBrains Mono typography plus frosted semantic color tokens in the global design system
- Use static typed demo data and client-side interaction state; uploads are preview-only and conversion controls simulate completed output
- Use bundled/generated imagery only where a real visual is required
- Validate the build and inspect key desktop and mobile pages in the running preview
