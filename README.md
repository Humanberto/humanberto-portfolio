# Humanberto

Award-grade portfolio and a portable, provider-agnostic **AI advocate agent** for
Roberto Pocas Leitao - product designer and Python developer.

This is a Turborepo monorepo. The portfolio is the flagship app; the advocate
agent is a standalone package designed to be dropped into any project by swapping
a single config.

## What's inside

```
humanberto/
├─ apps/
│  └─ web/                 # Next.js 15 portfolio (App Router, Tailwind v4)
├─ packages/
│  ├─ ui/                  # Design system: tokens (gold + deep purple), primitives
│  └─ advocate-agent/      # Portable AI chat: <AdvocateChat> + server handler + tools
└─ turbo.json
```

Related repositories (standalone, full-stack MVPs):

- **vztr-help** - hospital visitor coordination (Next.js + Supabase)
- **petchmaker** - temporary pet-care matching (Next.js + Supabase)

## Tech

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (CSS-first theme)
- Turborepo + npm workspaces
- Vercel AI SDK + AI Gateway (provider-agnostic LLM, defaults to Gemini Flash)
- A signature WebGL "living" background (deep-liquid + gold-dust circuitry)

## Develop

```bash
npm install
npm run dev      # turbo dev across the workspace
npm run build    # production build
npm run lint
npm run typecheck
```

## Git commits and pushes

Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, etc.).
See [CONTRIBUTING.md](./CONTRIBUTING.md) for branch workflow, commit examples, and push commands.
Commit messages are checked automatically via Husky + Commitlint after `npm install`.

## Design tokens

The brand palette (near-black ink, deep purple, gold) is defined once in
`packages/ui/src/tokens.ts` (for JS/GLSL) and mirrored in the Tailwind v4 theme in
`apps/web/src/app/globals.css` (for CSS utilities).

## License

Personal portfolio. Code is MIT unless noted otherwise; written content and
brand assets are not licensed for reuse.
