# invoice-app

Finance Management Dashboard built with Next.js, Appwrite, Zustand, ShadCN/UI,
TailwindCSS, and Vercel.

## Current Status

Phase 1 through Phase 5 are implemented:

- Next.js App Router with TypeScript strict mode and `src/`.
- TailwindCSS v4 and ShadCN/UI initialized.
- Public `/`, auth `/login` and `/signup`, and protected `/dashboard` and
  `/invoices` route groups.
- Auth and dashboard route groups with shared layout components.
- Feature and shared module folders for auth, dashboard, invoices, Appwrite,
  realtime, validation, utilities, stores, and shared types.
- ESLint, Prettier, Vitest, and Playwright scripts.
- Appwrite browser and server/admin client boundaries.
- Appwrite email/password signup, login, logout, password recovery, and session
  helpers.
- HttpOnly Appwrite session cookie handling for server actions and middleware.
- Next.js Proxy route protection, the current Next.js convention for
  middleware-style dashboard and invoice route gating.
- React Hook Form and Zod auth forms translated from local Maglo reference
  imagery, with inline errors, pending states, and toast feedback.
- Runtime validation for required Appwrite environment variables.
- Typed invoice document helpers with owner-scoped permissions.
- Reproducible Appwrite database, collection, attribute, index, and permission
  setup notes.
- Invoice validation schemas, finance utilities, dashboard aggregation, due-date
  utilities, and Naira formatting.
- Invoice create, edit, delete, and paid/unpaid status server actions with
  authenticated ownership checks, server-side derived totals, and route
  revalidation.
- Server-loaded invoice list and dashboard metric routes.
- Invoice creation/edit forms, responsive invoice table, all/paid/unpaid
  Zustand UI filters, mobile invoice cards, status controls, delete
  confirmation, empty/Appwrite-load-error states, and toast feedback.

Realtime subscriptions, full dashboard charts, production e2e flows, and Vercel
deployment are still pending later phases.

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
paidAt: datetime/string, optional
```

6. Add indexes:

```text
userId
status
dueDate
userId_status
userId_dueDate
```

Do not add custom `createdAt` or `updatedAt` attributes. The application uses
Appwrite's system `$createdAt` and `$updatedAt` document metadata and sorts
fetched invoices in the server helper.

7. Configure collection-level permissions so users cannot broadly read or write
   all invoices. Invoice documents are created with owner-only read, update, and
   delete permissions in `invoiceDocumentPermissions(userId)`.
8. Create a server API key for Vercel/local server actions and store it in
   `APPWRITE_API_KEY`. Never prefix this key with `NEXT_PUBLIC_`.

The Appwrite helpers live under `src/lib/appwrite`:

```text
config.ts       # environment parsing and validation
client.ts       # browser-safe Appwrite client helpers
admin.ts        # server-only node-appwrite admin/session clients
session.ts      # server-only Appwrite session read/write helpers
session-cookie.ts # edge-safe session cookie name/options
permissions.ts  # per-user invoice document permissions
database.ts     # typed invoice document helpers
```

Auth server actions store the Appwrite session secret in an HttpOnly cookie
named `a_session_<NEXT_PUBLIC_APPWRITE_PROJECT_ID>`. `src/proxy.ts` checks for
this cookie to gate `/dashboard` and `/invoices`, and server-only helpers verify
the session with Appwrite before trusted data access. Logout deletes the current
Appwrite session when possible and clears the local cookie before redirecting to
`/login`.

Password recovery uses Appwrite `Account.createRecovery()` from
`/forgot-password` and completes with `Account.updateRecovery()` from the
`/reset-password?userId=...&secret=...` callback. The recovery request response
is intentionally neutral so the UI does not reveal whether an email address is
registered. Add the local and production app origins as Appwrite Web platforms
so recovery callback URLs are accepted.

## Design Workflow

The checked-in Maglo reference images are the UI source of truth for major
screens. Use `docs/ui-design/Dashboard.png`,
`docs/ui-design/Invoices.png`, and `docs/ui-design/invoice.png` for visual
validation. Do not use Figma links or Figma MCP for design validation unless the
project docs are intentionally changed first.

Translate the local reference imagery into the app's Next.js, ShadCN/UI,
TailwindCSS, TypeScript, and accessibility conventions, then verify desktop and
mobile UI against the local images when the app can run.

Phase 5 uses the checked-in `docs/ui-design/Invoices.png` and
`docs/ui-design/invoice.png` references for invoice visual validation, keeps the
Maglo mark at `public/figma/maglo-exclude.svg`, and translates the sidebar, top
bar, search, create button, filter, table hierarchy, compact status badges,
action placement, mobile cards, and in-workspace load-error state into the
responsive invoice workspace. The shared auth screen uses
`public/auth-hero.png`, `public/maglo-mark.svg`, and
`public/auth-underline.svg`.

Browser verification is represented by the Playwright route protection smoke
test. End-to-end credential submission still requires configured Appwrite
environment variables and a test Appwrite project.

## Known Audit Status

`npm audit` currently reports two moderate findings through Next.js' bundled
PostCSS dependency. npm suggests `npm audit fix --force`, but that would
downgrade Next.js to an old breaking version, so it has not been applied.
