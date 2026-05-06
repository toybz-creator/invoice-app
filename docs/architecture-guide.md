# Architecture Guide

## 1. System Overview

The Finance Management Dashboard is a Next.js App Router application deployed on Vercel and backed by Appwrite. The app uses server actions for trusted mutations, Appwrite Auth for identity, Appwrite Database for invoice persistence, Appwrite Realtime for live invoice updates, and Zustand for focused UI state.

The core architectural rule is simple: Appwrite and server actions own persisted business data; client state only owns UI state and short-lived interaction state.

## 2. Recommended High-Level Flow

1. Anonymous user visits `/login` or `/signup`.
2. User authenticates through Appwrite Auth.
3. Next.js Proxy, the current middleware convention, protects dashboard routes
   by checking session state.
4. Dashboard pages fetch authenticated invoice data.
5. Invoice mutations run through Next.js Server Actions.
6. Server actions validate input, verify ownership, calculate derived financial values, and write to Appwrite.
7. Appwrite Realtime notifies open clients about invoice changes.
8. Dashboard metrics and invoice views update through revalidation and realtime synchronization.

## 2.1 UI Design References

The checked-in Maglo reference images under `docs/ui-design/` are the canonical
visual reference for the application shell and major screens. Implementation
should translate those images into accessible, responsive, production-ready
Next.js UI instead of creating unrelated layouts.

Screen mapping:

- `/dashboard`: `docs/ui-design/Dashboard.png`
- `/invoices`: `docs/ui-design/Invoices.png`
- Invoice detail / create-edit surface: `docs/ui-design/invoice.png`

Do not use Figma links or Figma MCP for design validation unless the product
docs are intentionally changed first. Use the local images for layout, spacing,
visual hierarchy, color intent, and component composition. Use ShadCN/UI,
TailwindCSS, semantic HTML, and tested application state to add missing
production states such as validation errors, loading, empty states, destructive
confirmations, permission failures, and realtime status.

### 2.2 Local Image Implementation Workflow

For every UI task touching a mapped screen:

1. Inspect the matching local image under `docs/ui-design/`.
2. Identify any existing local assets used by the screen.
3. Map the image structure to this app's route, feature, and component boundaries.
4. Implement with ShadCN/UI primitives, TailwindCSS tokens, semantic HTML, and accessible interaction states.
5. Add production states missing from the design in the same visual language.
6. Verify the local UI against the reference image with browser testing on desktop and mobile.

The local reference image should be treated as design context to translate into
the established architecture, typed data flow, form handling, realtime strategy,
and component conventions. If a local reference image is unavailable, document
the gap and proceed from the existing app design language.

## 3. Suggested Project Structure

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
      auth.actions.ts
      invoice.actions.ts
    layout.tsx
    page.tsx
    middleware.ts
  components/
    layout/
    ui/
    feedback/
  features/
    auth/
      components/
      schemas/
      services/
    dashboard/
      components/
      lib/
      types/
    invoices/
      components/
      schemas/
      services/
      lib/
      types/
  lib/
    appwrite/
      admin.ts
      client.ts
      config.ts
      database.ts
      permissions.ts
    realtime/
      appwrite-realtime.ts
      sse.ts
      socket.ts
      types.ts
    utils/
      currency.ts
      dates.ts
      result.ts
  stores/
    invoice-ui.store.ts
    shell.store.ts
  types/
    appwrite.ts
    invoice.ts
tests/
  unit/
  integration/
  e2e/
docs/
  PRD.md
  FRD.md
  NFRD.md
  architecture-guide.md
  task.md
```

This structure can be adjusted during implementation, but the separation of app routes, features, shared libraries, stores, and tests should remain.

### 3.1 Phase 1 Foundation Status

The app is scaffolded with Next.js `16.2.4`, React `19.2.4`, TypeScript strict mode, TailwindCSS v4, and ShadCN/UI. The repository uses the `src/` directory and App Router route groups:

- `src/app/(auth)/login` and `src/app/(auth)/signup` for anonymous authentication screens.
- `src/app/(dashboard)/dashboard` and `src/app/(dashboard)/invoices` for the authenticated application shell.
- `src/components/layout` for shared route shells.
- `src/components/ui` for ShadCN-owned primitives.
- `src/features/auth`, `src/features/dashboard`, and `src/features/invoices` for feature code.
- `src/lib/appwrite`, `src/lib/realtime`, `src/lib/validation`, and `src/lib/utils` for system boundaries.
- `src/stores` for focused Zustand UI state.
- `tests/unit`, `tests/integration`, and `tests/e2e` for the planned quality layers.

Phase 1 route pages are placeholders only. They intentionally do not implement final Maglo visual fidelity, Appwrite authentication, invoice persistence, middleware protection, or realtime behavior. Those are scheduled for later phases and must follow the local UI reference and security workflows in this guide.

Browser verification for these placeholder route shells was skipped during Phase 1 handoff per user request. Playwright smoke coverage is present in `tests/e2e/foundation.spec.ts` for later browser verification.

### 3.2 Phase 2 Appwrite Setup Status

Phase 2 Appwrite infrastructure is implemented:

- `src/lib/appwrite/config.ts` validates public and server environment
  variables with Zod.
- `src/lib/appwrite/client.ts` creates browser-safe Appwrite `Client`,
  `Account`, and `Databases` helpers from the `appwrite` web SDK.
- `src/lib/appwrite/admin.ts` is server-only and creates the admin client from
  `node-appwrite` with `APPWRITE_API_KEY`.
- `src/lib/appwrite/permissions.ts` creates owner-only invoice document
  permissions.
- `src/lib/appwrite/database.ts` provides typed invoice document list, get,
  create, update, and delete helpers that return typed success/error results.
- `src/types/invoice.ts` defines the shared invoice model and Appwrite document
  shape.

The database helper still expects Phase 4 server actions to perform form
validation and server-owned financial calculations before persistence. The
helper enforces document ownership for get/update/delete by comparing the stored
`userId` to the authenticated user ID passed by the caller.

### 3.3 Phase 3 Authentication Status

Phase 3 authentication is implemented:

- `src/features/auth/schemas/auth.schema.ts` defines shared Zod login and
  signup schemas.
- `src/features/auth/components` contains the React Hook Form auth forms and
  Maglo-derived auth presentation components.
- `src/app/actions/auth.actions.ts` owns signup, login, and logout server
  actions, plus password recovery request and completion actions.
- `src/lib/appwrite/admin.ts` exposes admin and session-scoped Appwrite account
  helpers.
- `src/lib/appwrite/session.ts` stores, clears, and verifies Appwrite session
  secrets through HttpOnly cookies.
- `src/lib/appwrite/session-cookie.ts` keeps cookie naming/options reusable by
  both server-only code and edge middleware.
- `src/proxy.ts` protects `/dashboard` and `/invoices`, and redirects
  authenticated users away from `/login`, `/signup`, and `/forgot-password`.

The auth server actions use the server/admin Appwrite boundary to create users
and email/password sessions. The returned Appwrite session secret is stored in
an HttpOnly `a_session_<projectId>` cookie with `sameSite: "lax"`,
production-only `secure`, root path, and the Appwrite session expiry. Login
persists this cookie by default; users should not be asked to sign in again
unless they log out or the Appwrite session itself expires. Proxy
checks only for the cookie so it remains fast and Edge-compatible; server code
must call `getAuthenticatedUser()` before trusted reads or mutations to verify
that the cookie still maps to a valid Appwrite session.

Session verification and Appwrite database operations use
`withAppwriteRetry()` from `src/lib/appwrite/retry.ts` to retry transient
network, timeout, rate-limit, and server errors before surfacing a user-facing
failure state. `APP_ENV=development` enables `src/lib/logger.ts` diagnostics for
auth, session, read, and mutation failures; production logs stay quiet unless
future observability tooling chooses to report sanitized events explicitly.

The sign in and sign up screens were implemented from Maglo reference material.
Required assets were captured locally under
`public/auth-hero.png`, `public/maglo-mark.svg`, and
`public/auth-underline.svg`. The implementation preserves the reference hierarchy while adding
accessible labels, inline validation errors, disabled pending states, toast
feedback, and responsive behavior.

## 4. Rendering Strategy

- Use Server Components for route-level data reads and static shell where possible.
- Use Client Components for forms, filters, charts, realtime subscriptions, modals, and toasts.
- Use Server Actions for all invoice mutations.
- Use route revalidation after mutations to keep server-rendered summaries correct.
- Use realtime subscriptions to keep open browser sessions updated.

Phase 1 uses Server Components for route shells. Client Components should be introduced only when a later feature needs form state, dialogs, filters, charts, realtime subscriptions, or other browser-side interactivity.

Phase 3 introduces Client Components for authentication forms only. Server
actions remain the trusted auth mutation boundary, and the auth route files stay
thin by delegating reusable behavior to `src/features/auth`.

Phase 4 and Phase 5 introduce the invoice domain and invoice workspace:

- `src/features/invoices/schemas/invoice.schema.ts` owns create, edit, delete,
  and status validation schemas shared by client forms and server actions.
- `src/features/invoices/lib/finance.ts` owns VAT, invoice total, Naira
  formatting, dashboard metric aggregation, and chart-ready summary utilities.
  The current Appwrite schema stores decimal number fields, but rounding is
  isolated here so a future minor-unit storage migration can happen behind this
  boundary.
- `src/features/invoices/lib/dates.ts` owns due-date countdown, due-soon, and
  overdue behavior using local-day comparisons to avoid obvious timezone drift
  in user-facing labels.
- `src/app/actions/invoice.actions.ts` is the trusted mutation boundary for
  create, edit, delete, and paid/unpaid updates. Every action resolves the
  authenticated Appwrite user, validates input, ignores client-provided derived
  or ownership fields, recalculates VAT/total server-side, uses owner-scoped
  Appwrite helpers, and revalidates `/dashboard` and `/invoices`.
- `src/stores/invoice-ui.store.ts` stores only UI state: current filter, search,
  create/edit/delete panel state. Persisted invoices remain Appwrite/server
  owned.
- `/invoices` is server-rendered for the authenticated user's invoice list and
  passes invoices into a client workspace for filters, forms, and table actions.
- `/dashboard` now derives core metrics and due-date insights from the same
  invoice list and finance/date utilities. Full chart components remain a later
  dashboard phase.

The Phase 5 invoice UI was revalidated against the local reference images in
`docs/ui-design/Invoices.png` and `docs/ui-design/invoice.png`. The Maglo mark asset remains local at
`public/figma/maglo-exclude.svg`. The invoice workspace preserves the
Maglo sidebar/topbar/table hierarchy, search, create button, filters, compact
rows, paid/unpaid badge treatment, and accessible actions. Appwrite load
failures now render inside the designed workspace instead of replacing the page
with a standalone error card, and mobile uses invoice cards instead of a forced
wide table. The implemented invoice edit flow uses an inline production panel
rather than a separate detail route for this phase, preserving validation,
accessibility, ownership checks, and responsive behavior.

## 5. Appwrite Architecture

### 5.1 Services

Use these Appwrite capabilities:

- Auth: account creation, login, logout, session management.
- Database: invoice documents.
- Permissions: per-user document access.
- Realtime: invoice create, update, and delete events.

The browser uses the `appwrite` SDK. Server-only code uses `node-appwrite`
because the server/admin boundary needs API-key authentication through
`setKey`.

For authentication, server actions use `node-appwrite` to create Appwrite users,
create email/password sessions, and delete the current session on logout. Client
components never receive the Appwrite session secret; they receive only typed
success/error results from server actions.

Password recovery uses `Account.createRecovery()` with an application-owned
`/reset-password` callback URL and `Account.updateRecovery()` with the `userId`
and `secret` query parameters returned by Appwrite. Recovery request responses
must remain neutral to avoid account enumeration. Appwrite Web platform
hostnames must include local and deployed app origins used for recovery links.

### 5.2 Environment Variables

Expected variables:

```text
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_APPWRITE_DATABASE_ID=
NEXT_PUBLIC_APPWRITE_INVOICES_COLLECTION_ID=
APPWRITE_API_KEY=
```

Only public IDs and endpoint values should use `NEXT_PUBLIC_*`. Server API keys must stay server-only.

### 5.3 Invoice Collection

Recommended fields:

```text
userId: string
clientName: string
clientEmail: string
amount: number
vatRate: number
vatAmount: number
total: number
dueDate: datetime/string
status: enum("paid", "unpaid")
paidAt: datetime/string/null
```

The application uses Appwrite's built-in `$createdAt` and `$updatedAt` document
metadata for invoice timestamps. Do not create custom `createdAt` or
`updatedAt` collection attributes.

Recommended indexes:

- `userId`
- `status`
- `dueDate`
- `userId_status`
- `userId_dueDate`

### 5.4 Permissions

Each invoice document should be readable and writable only by its owner. The
implemented `invoiceDocumentPermissions(userId)` grants owner-only read, update,
and delete permissions. Server actions must still verify ownership because
client data cannot be trusted, and admin SDK calls can bypass Appwrite's
document permission enforcement.

### 5.5 Session Handling

The local application session is an HttpOnly cookie named
`a_session_<NEXT_PUBLIC_APPWRITE_PROJECT_ID>`. It stores the Appwrite session
secret returned by `Account.createEmailPasswordSession()` and expires with the
Appwrite session. The cookie name helper has an edge-safe fallback for local
tests where Appwrite env vars are intentionally absent, but deployed
environments must set the project ID.

The route proxy uses the cookie for route gating only. Any server action that
reads or mutates user-owned data must call the server-only session helper to
resolve the authenticated Appwrite user. Server Component reads treat rejected
Appwrite sessions as anonymous without mutating cookies, because Next.js only
allows cookie deletion in Server Actions or Route Handlers. Logout remains the
explicit cookie-clearing path.

## 6. Financial Domain Rules

All persisted calculations must happen server-side.

```text
vatAmount = amount * (vatRate / 100)
total = amount + vatAmount
```

Rules:

- Amount must be greater than zero.
- VAT rate must be between an agreed minimum and maximum, recommended `0` to `100`.
- Store values in a precision-safe format. Prefer integer minor units, such as kobo, for production finance accuracy. If decimal storage is used initially, isolate it in calculation utilities so migration remains possible.
- Dashboard revenue should count paid invoices.
- Pending payments should count unpaid invoices.
- VAT collected should count paid invoices unless the product later defines accrual-based VAT.

## 7. Form Architecture

Use React Hook Form with Zod.

Requirements:

- Auth forms use shared login/signup schemas.
- Shared schema for create and edit invoice flows.
- Inline field errors.
- Submit loading state.
- Toast feedback after server action result.
- Accessible labels and descriptions.
- Server-side validation duplicated through the same schema or a server-safe equivalent.

## 8. State Management

Use Zustand for UI state only.

Good candidates:

- Current invoice filter.
- Dialog open state.
- Sidebar collapse state.
- Realtime connection status.
- Temporary chart preference.

Avoid:

- Making Zustand the database cache without explicit synchronization.
- Storing authenticated user secrets.
- Storing data that must survive refresh unless intentionally persisted.

## 9. Realtime Architecture

Create a typed realtime layer:

```text
lib/realtime/
  appwrite-realtime.ts
  sse.ts
  socket.ts
  types.ts
```

The UI should subscribe through feature hooks such as:

```text
useInvoiceRealtime({ userId })
```

The hook should:

- Subscribe to Appwrite invoice changes.
- Filter or verify events by user.
- Trigger route refresh or update a local synchronized view.
- Expose connection status.
- Clean up subscriptions.

SSE and Socket adapters should be introduced behind the same realtime boundary when needed. For the initial release, Appwrite Realtime may handle invoice updates directly while SSE/socket files document extension points or power non-invoice events.

## 10. Server Action Pattern

Server actions should follow this pattern:

1. Read authenticated user.
2. Parse and validate input.
3. Authorize access to target document.
4. Calculate server-owned derived fields.
5. Write to Appwrite.
6. Revalidate affected routes.
7. Return a typed result.

Recommended result shape:

```ts
type ActionResult<T> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
```

## 11. Testing Architecture

Use three layers:

- Unit tests for calculations, schemas, stores, and pure dashboard aggregations.
- Integration tests for server actions and Appwrite wrapper behavior.
- E2E tests for authentication and invoice workflows.

Recommended tools:

- Vitest for units.
- Testing Library for components.
- Playwright for E2E.

CI should run:

```text
lint
format:check
typecheck
test
test:e2e or e2e smoke
build
```

## 12. Documentation Standards

In-code documentation should be added where it explains intent:

- Financial calculation decisions.
- Security-sensitive Appwrite operations.
- Realtime subscription lifecycle.
- Non-obvious server action behavior.
- Workarounds for framework or vendor limitations.

Do not add comments that merely restate obvious code.

## 13. Deployment Architecture

Vercel hosts the Next.js app. Appwrite hosts auth, database, permissions, and realtime.

Deployment checklist:

- Vercel project connected to GitHub repository.
- Environment variables configured in Vercel.
- Appwrite project, database, collection, attributes, indexes, and permissions configured.
- Production build passes.
- Smoke test validates login, invoice creation, invoice update, dashboard metrics, and realtime refresh.
