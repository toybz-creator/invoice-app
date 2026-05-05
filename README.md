# invoice-app

Finance Management Dashboard built with Next.js, Appwrite, Zustand, ShadCN/UI,
TailwindCSS, and Vercel.

## Current Status

Phase 1 is scaffolded and Phase 2 Appwrite setup is implemented:

- Next.js App Router with TypeScript strict mode and `src/`.
- TailwindCSS v4 and ShadCN/UI initialized.
- Route shells for `/`, `/login`, `/signup`, `/dashboard`, and `/invoices`.
- Auth and dashboard route groups with shared layout components.
- Feature and shared module folders for auth, dashboard, invoices, Appwrite,
  realtime, validation, utilities, stores, and shared types.
- ESLint, Prettier, Vitest, and Playwright scripts.
- Appwrite browser and server/admin client boundaries.
- Runtime validation for required Appwrite environment variables.
- Typed invoice document helpers with owner-scoped permissions.
- Reproducible Appwrite database, collection, attribute, index, and permission
  setup notes.

The auth flows, invoice server actions, realtime subscriptions, dashboard
metrics, and Figma-fidelity UI implementation phases are still pending.

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

Create `.env.local` with these values:

```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_APPWRITE_DATABASE_ID=
NEXT_PUBLIC_APPWRITE_INVOICES_COLLECTION_ID=
APPWRITE_API_KEY=
```

Only public endpoint and ID values should use `NEXT_PUBLIC_*`. Server API keys
must remain server-only.

`APPWRITE_API_KEY` must be created from the Appwrite Console with enough scope
for server-side invoice document operations. The current server boundary uses
`node-appwrite` only inside `src/lib/appwrite/admin.ts`, which is marked
server-only.

## Appwrite Setup

1. Create an Appwrite project and copy its endpoint and project ID.
2. Enable Auth with the email/password provider.
3. Create a database for this app and copy the database ID.
4. Create an `invoices` collection, or another collection whose ID is stored in
   `NEXT_PUBLIC_APPWRITE_INVOICES_COLLECTION_ID`.
5. Add collection attributes:

```text
userId: string, required
clientName: string, required
clientEmail: email/string, required
amount: float, required
vatRate: float, required
vatAmount: float, required
total: float, required
dueDate: datetime/string, required
status: enum/string ["paid", "unpaid"], required
createdAt: datetime/string, required
updatedAt: datetime/string, required
paidAt: datetime/string, optional
```

6. Add indexes:

```text
userId
status
dueDate
userId_status
userId_dueDate
createdAt
```

7. Configure collection-level permissions so users cannot broadly read or write
   all invoices. Invoice documents are created with owner-only read, update, and
   delete permissions in `invoiceDocumentPermissions(userId)`.
8. Create a server API key for Vercel/local server actions and store it in
   `APPWRITE_API_KEY`. Never prefix this key with `NEXT_PUBLIC_`.

The Appwrite helpers live under `src/lib/appwrite`:

```text
config.ts       # environment parsing and validation
client.ts       # browser-safe Appwrite client helpers
admin.ts        # server-only node-appwrite admin client
permissions.ts  # per-user invoice document permissions
database.ts     # typed invoice document helpers
```

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
