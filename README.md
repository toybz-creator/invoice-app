# invoice-app

Finance Management Dashboard built with Next.js, Appwrite, Zustand, ShadCN/UI,
TailwindCSS, and Vercel.

## Features

<br />

- Next.js App Router with TypeScript strict mode and `src/`.
- TailwindCSS v4 and ShadCN/UI initialized.
- Public auth `/login` and `/signup`, and protected root `/` (Dashboard) and
  `/invoices` route groups.
- Auth and dashboard route groups with shared layout components.
- Feature and shared module folders for auth, dashboard, invoices, Appwrite,
  realtime, validation, utilities, stores, and shared types.
- ESLint, Prettier, Vitest, and Playwright scripts.
- Appwrite browser and server/admin client boundaries.
- Appwrite email/password signup, login, logout, password recovery, and session
  helpers.
- HttpOnly Appwrite session cookie handling for server actions and middleware.
- Persistent login cookies that use the Appwrite session expiry by default, so
  users stay signed in until the Appwrite session expires or they log out.
- Next.js Proxy route protection, the current Next.js convention for
  middleware-style dashboard and invoice route gating.
- React Hook Form and Zod auth forms translated from local Maglo reference
  imagery, with inline errors, pending states, and toast feedback.
- Runtime validation for required Appwrite environment variables.
- Typed invoice row helpers with owner-scoped permissions.
- Environment-aware development error logging and retry handling around
  Appwrite session verification, reads, and mutations.
- Reproducible Appwrite database, table, column, index, and permission
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
- Dashboard metric cards&#x20;
  including total invoices, paid revenue, pending payments, total VAT
  collected, and monthly payable VAT from authenticated invoice rows.
- Responsive Recharts dashboard visualizations for monthly revenue/VAT trend and paid versus unpaid split.
- Dashboard overdue and due-soon insight panels with due-date countdown labels.
- Typed realtime contracts under `src/lib/realtime`, an Appwrite Realtime
  adapter, and a documented SSE/socket extension path.
- Invoice realtime synchronization through `useInvoiceRealtime({ userId })`,
  with owner-filtered create/update/delete events, shared invoice store updates,
  connection status, cleanup on unmount, and retry behavior.

  <br />

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
NEXT_PUBLIC_APPWRITE_INVOICES_TABLE_ID=
APPWRITE_API_KEY=
APP_ENV=development
```

Only public endpoint and ID values should use `NEXT_PUBLIC_*`. Server API keys
must remain server-only.

`APP_ENV` controls server-side diagnostic logging. Use `development` locally to
log Appwrite/auth/action failures with useful context. Use `production` in
production so sensitive operational details are not printed to logs by default.
Accepted values are `development`, `preview`, `production`, and `test`.

`NEXT_PUBLIC_APPWRITE_INVOICES_TABLE_ID` is the preferred Appwrite TablesDB
table ID variable. `NEXT_PUBLIC_APPWRITE_INVOICES_COLLECTION_ID` is still
accepted as a temporary compatibility fallback for older local or Vercel
configuration.

`APPWRITE_API_KEY` must be created from the Appwrite Console with enough scope
for server-side invoice row operations through TablesDB. The current server
boundary uses `node-appwrite` only inside `src/lib/appwrite/admin.ts`, which is
marked server-only.

## Appwrite Setup

1. Create an Appwrite project and copy its endpoint and project ID.
2. Enable Auth with the email/password provider.
3. Create a database for this app and copy the database ID.
4. Create an `invoices` table, or another table whose ID is stored in
   `NEXT_PUBLIC_APPWRITE_INVOICES_TABLE_ID`.
5. Add table columns:

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

1. Add indexes:

```text
userId
status
dueDate
userId_status
userId_dueDate
```

Do not add custom `createdAt` or `updatedAt` columns. The application uses
Appwrite's system `$createdAt` and `$updatedAt` row metadata and sorts fetched
invoices in the server helper.

1. Configure table-level permissions so users cannot broadly read or write all
   invoices. Invoice rows are created with owner-only read, update, and delete
   permissions in `invoiceRowPermissions(userId)`.
2. Create a server API key for Vercel/local server actions and store it in
   `APPWRITE_API_KEY`. Never prefix this key with `NEXT_PUBLIC_`.

The Appwrite helpers live under `src/lib/appwrite`:

```text
config.ts       # environment parsing and validation
client.ts       # browser-safe Appwrite client helpers
admin.ts        # server-only node-appwrite admin/session clients
session.ts      # server-only Appwrite session read/write helpers
session-cookie.ts # edge-safe session cookie name/options
permissions.ts  # per-user invoice row permissions
database.ts     # typed invoice row helpers
```

Auth server actions store the Appwrite session secret in an HttpOnly cookie
named `a_session_<NEXT_PUBLIC_APPWRITE_PROJECT_ID>`. `src/proxy.ts` checks for
this cookie to gate `/dashboard` and `/invoices`, and server-only helpers verify
the session with Appwrite before trusted data access. Logout deletes the current
Appwrite session when possible and clears the local cookie before redirecting to
`/login`. Login always persists the local cookie until the Appwrite session
expiry so routine browser refreshes and direct URL visits do not force users to
sign in again.

Invoice persistence uses the current Appwrite TablesDB SDK APIs:
`listRows()`, `getRow()`, `createRow()`, `updateRow()`, and `deleteRow()`.
Appwrite session verification, invoice reads, and invoice mutations are wrapped
with a small retry layer for transient network, timeout, rate-limit, and 5xx
failures. In `APP_ENV=development`, those failures are logged with operation
labels and non-secret context to make direct-load and mutation issues easier to
debug.

Password recovery uses Appwrite `Account.createRecovery()` from
`/forgot-password` and completes with `Account.updateRecovery()` from the
`/reset-password?userId=...&secret=...` callback. The recovery request response
is intentionally neutral so the UI does not reveal whether an email address is
registered. Add the local and production app origins as Appwrite Web platforms
so recovery callback URLs are accepted.

##

##
