# invoice-app

Finance Management Dashboard built with Next.js, Appwrite, Zustand, ShadCN/UI,
TailwindCSS, and Vercel.

## Current Status

Phase 1 is scaffolded:

- Next.js App Router with TypeScript strict mode and `src/`.
- TailwindCSS v4 and ShadCN/UI initialized.
- Route shells for `/`, `/login`, `/signup`, `/dashboard`, and `/invoices`.
- Auth and dashboard route groups with shared layout components.
- Feature and shared module folders for auth, dashboard, invoices, Appwrite,
  realtime, validation, utilities, stores, and shared types.
- ESLint, Prettier, Vitest, and Playwright scripts.

The auth, invoice, Appwrite, realtime, dashboard metric, and Figma-fidelity UI
implementation phases are still pending.

## Prerequisites

- Node.js 20.19+ or a newer supported LTS version.
- npm.

## Setup

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Scripts

```bash
npm run dev           # Start the local Next.js dev server.
npm run build         # Build the production app.
npm run start         # Start a production build locally.
npm run lint          # Run ESLint.
npm run format        # Format files with Prettier.
npm run format:check  # Check Prettier formatting.
npm run typecheck     # Run TypeScript without emitting files.
npm run test          # Run Vitest unit/integration tests.
npm run test:watch    # Run Vitest in watch mode.
npm run e2e           # Run Playwright e2e tests.
```

Prettier is configured in `.prettierrc.json` with double quotes, semicolons,
trailing commas, and an 80-character print width. ESLint uses Next.js core
web-vitals, TypeScript rules, and `eslint-plugin-simple-import-sort`.

## Project Structure

```text
src/
  app/
    (auth)/
      login/
      signup/
    (dashboard)/
      dashboard/
      invoices/
    actions/
  components/
    feedback/
    layout/
    ui/
  features/
    auth/
    dashboard/
    invoices/
  lib/
    appwrite/
    realtime/
    utils/
    validation/
  stores/
  types/
tests/
  unit/
  integration/
  e2e/
```

Route files should stay thin. Feature behavior belongs under `src/features/*`,
trusted mutations under `src/app/actions`, Appwrite boundaries under
`src/lib/appwrite`, and realtime adapters under `src/lib/realtime`.

## Environment Variables

Appwrite integration is scheduled for Phase 2. The planned variables are:

```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_APPWRITE_DATABASE_ID=
NEXT_PUBLIC_APPWRITE_INVOICES_COLLECTION_ID=
APPWRITE_API_KEY=
```

Only public endpoint and ID values should use `NEXT_PUBLIC_*`. Server API keys
must remain server-only.

## Design Workflow

The Maglo Financial Management Web UI Kit Figma frames are the UI source of
truth for sign in, sign up, dashboard, invoice list, and invoice detail screens.

Before building or materially changing those screens, use the Codex `@Figma`
plugin to fetch the exact frame's structured design context, capture a
screenshot, and identify required assets. Translate the result into the app's
Next.js, ShadCN/UI, TailwindCSS, TypeScript, and accessibility conventions, then
verify desktop and mobile UI against the Figma screenshot when the local app can
run.

Phase 1 uses lightweight route placeholders only; the full Figma implementation
workflow begins when the real auth, dashboard, and invoice screens are built.

Browser verification for the Phase 1 route shells was intentionally skipped at
handoff time per user request. A Playwright smoke test exists under `tests/e2e`
for when browser checks resume.

## Known Audit Status

`npm audit` currently reports two moderate findings through Next.js' bundled
PostCSS dependency. npm suggests `npm audit fix --force`, but that would
downgrade Next.js to an old breaking version, so it has not been applied.
