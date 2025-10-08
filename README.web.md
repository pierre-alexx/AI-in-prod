# AI UI Design Agent (MVP)

Next.js 14 (App Router) + TypeScript + TailwindCSS + Supabase starter for an intelligent UI generation tool.

## Quick Start

1. Install deps

```bash
pnpm install
```

2. Configure environment

Create `.env.local` and set:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Run dev server

```bash
pnpm dev
```

## API Endpoints (mocked)
- POST `/api/profile/train` — upload inspiration files → mock profile id
- POST `/api/generate` — returns 3 mock variants
- POST `/api/improve/analyze` — accepts zip or repo URL → mock analysis
- POST `/api/improve/apply` — returns mock patch summary
- POST `/api/revise` — prompt-to-revision mock
- POST `/api/export/code` — returns mock zip URL
- POST `/api/export/figma` — returns mock figma JSON
- POST `/api/feedback` — records mock feedback

## Database
SQL migrations in `supabase/migrations`. Enable `pgvector` and apply tables + RLS.

## Roadmap
- Wire Supabase Auth and storage
- Add embeddings pipeline
- Export React/Tailwind zip and Figma JSON
- Improve Mode: real AST parsing and WCAG checks
- Chat copilot
