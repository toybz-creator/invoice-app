# Implementation Task Plan

## Objective

Build the Finance Management Dashboard task by task until it is production-ready: authenticated, modular, typed, documented, tested, real-time, deployable on Vercel, and backed by Appwrite.

Each task should be completed with code, tests where relevant, and documentation updates before moving to the next major phase.

## Figma References for UI Tasks

Use these Figma frames through the Codex `@Figma` plugin before implementing or materially changing the corresponding screens:

- Sign in: <https://www.figma.com/design/fjLI67zOWLAkFMJuE1TKNt/Maglo---Financial-Management-Web-UI-Kit--Community---Copy---Copy-?node-id=122-1782&t=LudK3VlLncYCZtMA-4>
- Sign up: <https://www.figma.com/design/fjLI67zOWLAkFMJuE1TKNt/Maglo---Financial-Management-Web-UI-Kit--Community---Copy---Copy-?node-id=134-2419&t=LudK3VlLncYCZtMA-4>
- Dashboard: <https://www.figma.com/design/fjLI67zOWLAkFMJuE1TKNt/Maglo---Financial-Management-Web-UI-Kit--Community---Copy---Copy-?node-id=36-569&t=LudK3VlLncYCZtMA-4>
- Invoices list: <https://www.figma.com/design/fjLI67zOWLAkFMJuE1TKNt/Maglo---Financial-Management-Web-UI-Kit--Community---Copy---Copy-?node-id=51-1249&t=LudK3VlLncYCZtMA-4>
- Invoice detail: <https://www.figma.com/design/fjLI67zOWLAkFMJuE1TKNt/Maglo---Financial-Management-Web-UI-Kit--Community---Copy---Copy-?node-id=59-1718&t=LudK3VlLncYCZtMA-4>

Required UI task workflow:

1. Use Codex `@Figma` to fetch structured design context for the exact frame, using `get_design_context` when available.
2. Capture the matching Figma screenshot, using `get_screenshot` when available.
3. Identify and use required Figma assets rather than placeholders.
4. Translate the frame into this app's Next.js, ShadCN/UI, TailwindCSS, TypeScript, and accessibility patterns.
5. Add missing production states, including loading, empty, error, validation, disabled, realtime-disconnected, and confirmation states.
6. Run browser verification against the Figma screenshot on desktop and mobile when a local server and any required credentials are available.
7. Record any `@Figma` access or visual verification gap in the final handoff.

## Phase 1: Project Foundation

### TASK-001: Scaffold Next.js Application

Deliverables:

- Create a Next.js App Router project with TypeScript.
- Configure `src/` directory.
- Configure TailwindCSS and ShadCN/UI.
- Add base layouts for auth and dashboard route groups.

Done when:

- App runs locally.
- TypeScript strict mode is enabled.
- Basic home, login, signup, and dashboard routes exist.

### TASK-002: Configure Code Quality Tooling

Deliverables:

- ESLint configuration.
- Prettier configuration.
- Import ordering rules.
- Scripts for lint, format, typecheck, test, e2e, and build.

Done when:

- `npm run lint`, `npm run typecheck`, and `npm run build` scripts exist.
- Formatting rules are documented in `README.md`.

### TASK-003: Establish App Structure

Deliverables:

- Create feature folders for auth, dashboard, and invoices.
- Create shared folders for Appwrite, realtime, utilities, stores, and types.
- Add placeholder module README or comments only where they clarify architecture.

Done when:

- Folder structure matches `docs/architecture-guide.md` closely.
- No feature code is dumped directly into route files unless route-specific.

## Phase 2: Appwrite Setup

### TASK-004: Configure Appwrite Project

Deliverables:

- Create or document Appwrite project.
- Configure Auth email/password.
- Create database and invoices collection.
- Add required attributes and indexes.
- Configure document permission strategy.

Done when:

- Required environment variables are documented.
- Appwrite setup steps are reproducible from `README.md` or a dedicated docs section.

### TASK-005: Build Appwrite Client Modules

Deliverables:

- Browser-safe Appwrite client.
- Server/admin Appwrite client.
- Config loader with runtime validation.
- Database helper functions.

Done when:

- Server-only API key is never exposed to client bundles.
- Appwrite wrappers are typed.
- Failure modes return useful errors.

## Phase 3: Authentication

### TASK-006: Build Auth Schemas and Forms

Deliverables:

- Login schema.
- Signup schema.
- Login form using React Hook Form and Zod, matching the Sign in Figma frame.
- Signup form using React Hook Form and Zod, matching the Sign up Figma frame.
- Loading, inline error, and toast states.

Done when:

- Invalid inputs show field-level errors.
- Auth pages are responsive and accessible.

### TASK-007: Implement Auth Actions and Session Handling

Deliverables:

- Signup server action or secure auth flow.
- Login server action or secure auth flow.
- Logout action.
- Session helper utilities.

Done when:

- User can sign up, log in, and log out.
- Auth state survives refresh as expected.
- Errors are handled without exposing sensitive details.

### TASK-008: Add Middleware Route Protection

Deliverables:

- Next.js Middleware protecting authenticated routes.
- Redirect behavior for anonymous and authenticated users.

Done when:

- Anonymous users cannot access dashboard routes.
- Authenticated users land on dashboard after login.

## Phase 4: Invoice Domain

### TASK-009: Define Invoice Types and Validation

Deliverables:

- Invoice TypeScript types.
- Create invoice schema.
- Edit invoice schema.
- Status update schema.
- Shared currency and date types where useful.

Done when:

- Form and server action inputs share typed validation rules.
- No untyped invoice payloads are used.

### TASK-010: Build Financial Calculation Utilities

Deliverables:

- VAT calculation utility.
- Invoice total utility.
- Dashboard aggregation utility.
- Due-date countdown and overdue utility.
- Currency formatter for Nigerian Naira.

Done when:

- Unit tests cover calculation edge cases.
- Server actions use these utilities instead of duplicating formulas.

### TASK-011: Implement Invoice Server Actions

Deliverables:

- Create invoice action.
- Edit invoice action.
- Delete invoice action.
- Mark paid/unpaid action.
- Ownership checks.
- Route revalidation.

Done when:

- All mutations validate input server-side.
- Derived values are calculated server-side.
- Actions return typed success/error results.

## Phase 5: Invoice UI

### TASK-012: Build Invoice Creation Form

Deliverables:

- Form fields for client name, client email, amount, VAT, due date, and status.
- Live client-side VAT and total preview.
- Server action integration.
- Toast notifications.

Done when:

- Invalid data cannot be submitted.
- Successful create updates invoice list and dashboard state.

### TASK-013: Build Invoice Table and Filters

Deliverables:

- Responsive invoice table matching the Invoices list Figma frame.
- All/Paid/Unpaid filter using Zustand.
- Status badges.
- Empty, loading, and error states.

Done when:

- Table works on desktop and mobile.
- Filter state does not pollute persisted server data.

### TASK-014: Build Edit, Delete, and Status Actions

Deliverables:

- Edit invoice dialog or page aligned with the Invoice detail Figma frame where the flow uses a detail view.
- Delete confirmation dialog.
- Mark paid/unpaid control.
- Accessible action buttons and menus.

Done when:

- Each action calls the correct server action.
- UI handles success, failure, and pending states.

## Phase 6: Dashboard

### TASK-015: Build Dashboard Metrics

Deliverables:

- Dashboard layout and metric cards matching the Dashboard Figma frame.
- Total invoices metric.
- Total paid amount metric.
- Pending payments metric.
- Total VAT collected metric.
- Monthly payable VAT metric.

Done when:

- Metrics are derived from authenticated user invoices.
- Metrics update after invoice mutations.

### TASK-016: Build Charts

Deliverables:

- Paid versus unpaid chart.
- Monthly revenue or VAT trend chart.
- Empty chart states.

Done when:

- Charts are responsive.
- Chart data is typed and tested.

### TASK-017: Build Alerts and Insights

Deliverables:

- Overdue invoice section.
- Due-soon invoice section.
- Due-date countdown display.

Done when:

- Unpaid and overdue invoices are clearly highlighted.
- Date calculations are unit tested.

## Phase 7: Realtime

### TASK-018: Build Realtime Abstraction

Deliverables:

- `lib/realtime/types.ts`.
- Appwrite realtime adapter.
- SSE adapter placeholder or implementation.
- Socket adapter placeholder or implementation.

Done when:

- UI imports typed realtime hooks/services, not raw vendor calls.
- Extension path for SSE/socket is documented.

### TASK-019: Connect Invoice Realtime Updates

Deliverables:

- Invoice realtime hook.
- Connection status in Zustand or local hook state.
- Cleanup on unmount/logout.
- Refresh or local sync strategy.

Done when:

- Creating/updating/deleting an invoice in one tab updates another open tab.
- Realtime failure does not block manual CRUD.

## Phase 8: Testing

### TASK-020: Configure Unit and Component Tests

Deliverables:

- Vitest or Jest setup.
- Testing Library setup.
- Unit tests for schemas, calculations, date utilities, and stores.
- Component tests for forms and table states where practical.

Done when:

- Unit test script passes locally.
- Critical financial logic has meaningful coverage.

### TASK-021: Configure E2E Tests

Deliverables:

- Playwright setup.
- Authenticated test strategy.
- E2E tests for login, create, edit, mark paid, filter, delete, and dashboard metrics.

Done when:

- E2E tests can run locally.
- Test data is isolated from production data.

### TASK-022: Add CI Quality Gate

Deliverables:

- CI workflow or documented Vercel/GitHub checks.
- Lint, format check, typecheck, unit tests, e2e smoke, and build.

Done when:

- A failing quality check blocks merge or deployment.

## Phase 9: Documentation

### TASK-023: Complete README

Deliverables:

- Project overview.
- Tech stack.
- Local setup.
- Environment variables.
- Appwrite setup.
- Development scripts.
- Testing guide.
- Deployment guide.

Done when:

- A new developer can run the project from the README alone.

### TASK-024: Maintain Architecture Guide

Deliverables:

- Update `docs/architecture-guide.md` with final folder structure.
- Document Appwrite collection schema and indexes.
- Document realtime implementation choice.
- Document testing approach.

Done when:

- Architecture guide matches implemented code.

### TASK-025: Add In-Code Documentation

Deliverables:

- Comments for financial calculation decisions.
- Comments for server action security boundaries.
- Comments for realtime lifecycle behavior.

Done when:

- Important non-obvious decisions are documented.
- Obvious code is not cluttered with low-value comments.

## Phase 10: Production Hardening and Deployment

### TASK-026: Security Review

Deliverables:

- Verify route protection.
- Verify Appwrite permissions.
- Verify server action ownership checks.
- Verify env var exposure.
- Verify form and server validation.

Done when:

- No known path allows one user to read or mutate another user's invoice.

### TASK-027: Performance and UX Pass

Deliverables:

- Review bundle size.
- Review mobile layouts.
- Review loading, empty, and error states.
- Verify chart responsiveness.
- Verify no avoidable rerender hotspots.

Done when:

- App feels smooth on desktop and mobile.
- Core flows are polished rather than merely functional.

### TASK-028: Vercel Deployment

Deliverables:

- Configure Vercel project.
- Add environment variables.
- Deploy production build.
- Run smoke tests against production.

Done when:

- Deployed app works on Vercel.
- Login, invoice CRUD, dashboard metrics, and realtime are verified.

### TASK-029: Demo Video Preparation

Deliverables:

- Script a 2 to 3 minute demo.
- Show login, invoice creation, payment update, filters, dashboard summaries, and realtime if possible.

Done when:

- Demo clearly proves the PRD objectives.

## Recommended Build Order

1. Foundation and tooling.
2. Appwrite setup.
3. Auth and middleware.
4. Invoice domain logic and server actions.
5. Invoice UI.
6. Dashboard metrics and charts.
7. Realtime.
8. Tests.
9. Documentation.
10. Production hardening and deployment.

## Definition of Done for the Project

- Authenticated users can manage invoices end to end.
- Dashboard totals, VAT, and charts are correct.
- Appwrite stores and protects data correctly.
- Server actions own all mutations.
- Realtime updates work for invoice changes.
- Zustand is used for appropriate UI state.
- Unit and e2e tests cover critical flows.
- Code is typed, modular, linted, formatted, and documented.
- `README.md` and `docs/architecture-guide.md` are complete.
- App is deployed on Vercel and smoke-tested.
