# Non-Functional Requirements Document

## 1. Purpose

This document defines the quality, reliability, security, maintainability, testing, and deployment expectations for the Finance Management Dashboard.

The application must be built as a production system, not a surface-level demo. Every major feature should have validation, typed contracts, error handling, secure data access, useful tests, and clear module boundaries.

## 2. Technology Requirements

### 2.1 Core Stack

- Next.js latest stable version using the App Router.
- TypeScript in strict mode.
- TailwindCSS latest stable version.
- ShadCN/UI for accessible primitives and consistent UI composition.
- Appwrite SDK for Auth, Database, Permissions, and Realtime.
- Zustand for focused client state.
- Recharts or a maintained chart library for dashboard visualizations.
- Zod for validation.
- React Hook Form or equivalent mature form library for controlled form workflows.
- Vercel for hosting.

### 2.2 Realtime Stack

- Appwrite Realtime is the default realtime source for invoice database changes.
- SSE or Socket support must be represented as a typed abstraction so future realtime channels can be added without rewriting UI components.
- Use SSE for one-way status streams.
- Use WebSocket/socket only for bidirectional behavior that Appwrite Realtime does not cover.

## 3. Architecture Requirements

- Use a modular folder structure grouped by feature and system concern.
- Keep server-only Appwrite admin clients separate from browser clients.
- Keep domain calculations in reusable utility modules.
- Keep validation schemas shared between forms and server actions where safe.
- Keep UI components presentational where possible.
- Keep data mutations in server actions.
- Keep realtime subscriptions in hooks or service modules, not scattered through page components.
- Document architecture decisions in `docs/architecture-guide.md`.

Expected module categories:

- `app`: routes, layouts, middleware, server actions entry points.
- `components`: shared UI and layout components.
- `features/auth`: authentication forms and services.
- `features/invoices`: invoice forms, table, schemas, actions, and domain logic.
- `features/dashboard`: metrics, charts, summaries, and insights.
- `lib/appwrite`: Appwrite clients and helpers.
- `lib/realtime`: Appwrite/SSE/socket adapters.
- `lib/validation`: reusable schemas.
- `lib/utils`: formatting, dates, currency, and calculation helpers.
- `stores`: Zustand stores.
- `types`: shared TypeScript types.
- `tests`: unit, integration, and e2e tests as appropriate.

## 4. Security Requirements

### 4.1 Authentication and Session Security

- Dashboard routes must be protected with Next.js Middleware.
- Session cookies must use secure, HTTP-only behavior where the selected Appwrite auth strategy supports it.
- Logout must clear user-sensitive client state.
- Authentication errors must not leak sensitive system details.

### 4.2 Authorization

- Users must only access their own invoices.
- Server actions must validate the authenticated user before every create, update, delete, and status change.
- Appwrite document permissions must be configured per user.
- Client-provided `userId`, totals, VAT amount, and ownership-sensitive fields must not be trusted.

### 4.3 Input Validation

- All form submissions must be validated with Zod or an equivalent schema.
- Server actions must revalidate all input even when the client already validates.
- Numeric fields must reject invalid values, negative amounts, unsafe precision, and impossible VAT rates.
- Email and date fields must be validated and normalized.

### 4.4 Secrets

- Appwrite endpoint, project ID, database ID, collection IDs, and server API keys must be loaded from environment variables.
- Server-only keys must never be exposed through `NEXT_PUBLIC_*`.
- Vercel environment variable setup must be documented.
- Environment variables should be typed to avoid errors

## 5. Performance Requirements

- Initial dashboard render should be optimized with server components where practical.
- Client components should be used only where interactivity is required.
- Table, chart, and summary calculations should avoid unnecessary rerenders.
- Zustand selectors should be used to prevent broad subscriptions.
- Bundle size should be monitored before deployment.
- Images, fonts, and assets must use Next.js optimization features where applicable.
- Dashboard data should use route revalidation or cache invalidation deliberately after mutations.
- Lists should use pagination and not just fetch all data
- App should use lazy loading mechanism as much as possible to prevent resource waste and make app efficient
- App must be interactive using loaders and other appropriate elements to tell when a background operation is active
- App must prevent double submissions across board

Target expectations:

- Main dashboard should feel interactive within 2 seconds on a typical broadband connection.
- Invoice mutations should provide immediate pending feedback.
- Realtime updates should appear without a full page reload.

## 6. Reliability Requirements

- Every server action must return a typed success or error result.
- Appwrite failures must be handled gracefully.
- Realtime disconnects must not break normal CRUD behavior.
- The app must show loading, empty, and error states for dashboard and invoice views.
- Financial calculations must be deterministic and covered by unit tests.
- Date handling must be timezone-aware enough to avoid incorrect due-date states.

## 7. Testing Requirements

### 7.1 Unit Tests

Required coverage:

- VAT calculation.
- Invoice total calculation.
- Dashboard metric aggregation.
- Due-date status and countdown logic.
- Validation schemas.
- Zustand store behavior where business-relevant.

Recommended tooling:

- Vitest or Jest.
- Testing Library for React components.

### 7.2 Integration Tests

Required coverage:

- Server action validation and ownership checks.
- Appwrite service wrapper behavior using mocks or a local test strategy.
- Form submission success and failure states.

### 7.3 End-to-End Tests

Required user journeys:

- Signup or mocked authenticated session.
- Login.
- Create invoice.
- Edit invoice.
- Mark invoice as paid.
- Filter invoices.
- Delete invoice.
- Confirm dashboard metrics update.

Recommended tooling:

- Playwright.

### 7.4 Test Quality Rules

- Tests must be deterministic.
- Tests should avoid relying on production Appwrite data.
- E2E tests should run against a dedicated test project, emulator-like setup, or mocked backend depending on final infrastructure choice.
- CI must run lint, typecheck, unit tests, and e2e tests or an agreed smoke subset.

## 8. Code Quality Requirements

- TypeScript strict mode must be enabled.
- No implicit `any` in application code.
- Shared domain types must be exported from a controlled location.
- ESLint and Prettier must be configured.
- Imports should be consistently ordered.
- Components should be small enough to understand and test.
- Comments should explain non-obvious decisions, not repeat the code.
- Public functions handling domain behavior should have clear names and typed inputs/outputs.

## 9. Accessibility Requirements

- Forms must have labels, descriptions, validation messages, and keyboard support.
- Buttons and icon-only controls must have accessible names.
- Tables must remain understandable to screen readers.
- Toast notifications must not be the only place critical errors appear.
- Color cannot be the only signal for paid/unpaid/overdue states.
- Responsive behavior must support mobile and desktop.

## 9.1 Visual Fidelity Requirements

- UI implementation must use the screen-specific local reference images documented in `docs/PRD.md` and `docs/FRD.md`.
- Agents and developers must inspect the relevant image in `docs/ui-design/` before implementing or materially changing dashboard, invoice list, or invoice detail screens.
- Do not use Figma links or Figma MCP for design validation unless the product documents are intentionally changed first.
- The local image is a design contract, not copy-paste application code. Implementations must adapt it to the app's Next.js App Router, ShadCN/UI, TailwindCSS, TypeScript, validation, data, and accessibility patterns.
- Any intentional deviation from the local reference must be documented in `docs/architecture-guide.md` or the relevant task notes with the reason, especially when driven by accessibility, responsive behavior, missing states, or production requirements.
- Browser verification must compare desktop and mobile implementations against the local reference image where credentials and local server state allow it.
- If a local reference image is unavailable, the agent must continue from documented references, avoid inventing unrelated layouts, and explicitly record the verification gap.

## 10. Observability Requirements

- Important server action failures should be logged server-side.
- Logs must not include secrets or sensitive personal data.
- Client-facing error messages should be human-readable.
- Optional production monitoring can be added through Vercel and a logging/analytics provider after MVP.

## 11. Deployment Requirements

- The app must deploy to Vercel.
- Build must pass locally before deployment.
- Environment variables must be documented for local and Vercel environments.
- Appwrite collections, indexes, and permissions must be documented and reproducible.
- Deployment should include a smoke test checklist.

## 12. Maintainability Requirements

- `README.md` must explain installation, local development, testing, Appwrite setup, and deployment.
- `docs/architecture-guide.md` must describe data flow, service boundaries, realtime approach, and testing approach.
- Each major feature should be implemented in its own feature folder.
- Appwrite collection schemas and required indexes must be documented.
- Technical decisions should favor maintainability over quick one-off implementation.
