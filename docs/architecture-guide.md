# Architecture Guide

## 1. System Overview

The Finance Management Dashboard is a Next.js App Router application deployed on Vercel and backed by Appwrite. The app uses server actions for trusted mutations, Appwrite Auth for identity, Appwrite Database for invoice persistence, Appwrite Realtime for live invoice updates, and Zustand for focused UI state.

The core architectural rule is simple: Appwrite and server actions own persisted business data; client state only owns UI state and short-lived interaction state.

## 2. Recommended High-Level Flow

1. Anonymous user visits `/login` or `/signup`.
2. User authenticates through Appwrite Auth.
3. Next.js Middleware protects dashboard routes by checking session state.
4. Dashboard pages fetch authenticated invoice data.
5. Invoice mutations run through Next.js Server Actions.
6. Server actions validate input, verify ownership, calculate derived financial values, and write to Appwrite.
7. Appwrite Realtime notifies open clients about invoice changes.
8. Dashboard metrics and invoice views update through revalidation and realtime synchronization.

## 2.1 UI Design References

The Maglo Financial Management Web UI Kit Figma file is the canonical visual reference for the application shell and major screens. Implementation should translate the referenced frames into accessible, responsive, production-ready Next.js UI instead of creating unrelated layouts.

Screen mapping:

- `/login`: <https://www.figma.com/design/fjLI67zOWLAkFMJuE1TKNt/Maglo---Financial-Management-Web-UI-Kit--Community---Copy---Copy-?node-id=122-1782&t=LudK3VlLncYCZtMA-4>
- `/signup`: <https://www.figma.com/design/fjLI67zOWLAkFMJuE1TKNt/Maglo---Financial-Management-Web-UI-Kit--Community---Copy---Copy-?node-id=134-2419&t=LudK3VlLncYCZtMA-4>
- `/dashboard`: <https://www.figma.com/design/fjLI67zOWLAkFMJuE1TKNt/Maglo---Financial-Management-Web-UI-Kit--Community---Copy---Copy-?node-id=36-569&t=LudK3VlLncYCZtMA-4>
- `/invoices`: <https://www.figma.com/design/fjLI67zOWLAkFMJuE1TKNt/Maglo---Financial-Management-Web-UI-Kit--Community---Copy---Copy-?node-id=51-1249&t=LudK3VlLncYCZtMA-4>
- `/invoices/[id]` or invoice detail view: <https://www.figma.com/design/fjLI67zOWLAkFMJuE1TKNt/Maglo---Financial-Management-Web-UI-Kit--Community---Copy---Copy-?node-id=59-1718&t=LudK3VlLncYCZtMA-4>

Use Figma for layout, spacing, visual hierarchy, color intent, and component composition. Use ShadCN/UI, TailwindCSS, semantic HTML, and tested application state to add missing production states such as validation errors, loading, empty states, destructive confirmations, permission failures, and realtime status.

### 2.2 Codex `@Figma` Implementation Workflow

For every UI task touching a mapped screen, use the Codex `@Figma` plugin before implementation:

1. Fetch structured design context for the exact Figma node.
2. Capture a screenshot for the same node and viewport variant.
3. Download or reference Figma-provided assets, icons, and SVGs needed for the screen.
4. Map Figma structure to this app's route, feature, and component boundaries.
5. Implement with ShadCN/UI primitives, TailwindCSS tokens, semantic HTML, and accessible interaction states.
6. Add production states missing from the design in the same visual language.
7. Verify the local UI against the Figma screenshot with browser testing on desktop and mobile.

The `@Figma` output should not be pasted directly as final code. Treat it as design context to translate into the established architecture, typed data flow, form handling, realtime strategy, and component conventions. When Figma access, assets, or screenshots are unavailable, document the gap and proceed from the canonical frame links and existing design decisions.

When the plugin exposes Figma MCP actions, the expected calls are `get_design_context` for structure and measurements, `get_screenshot` for visual comparison, and asset download/reference only for the assets used by the target frame.

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

## 4. Rendering Strategy

- Use Server Components for route-level data reads and static shell where possible.
- Use Client Components for forms, filters, charts, realtime subscriptions, modals, and toasts.
- Use Server Actions for all invoice mutations.
- Use route revalidation after mutations to keep server-rendered summaries correct.
- Use realtime subscriptions to keep open browser sessions updated.

## 5. Appwrite Architecture

### 5.1 Services

Use these Appwrite capabilities:

- Auth: account creation, login, logout, session management.
- Database: invoice documents.
- Permissions: per-user document access.
- Realtime: invoice create, update, and delete events.

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
createdAt: datetime/string
updatedAt: datetime/string
```

Recommended indexes:

- `userId`
- `status`
- `dueDate`
- `userId_status`
- `userId_dueDate`

### 5.4 Permissions

Each invoice document should be readable and writable only by its owner. Server actions must still verify ownership because client data cannot be trusted.

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
