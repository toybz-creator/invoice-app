# AGENTS.md

This file is the operating guide for AI agents working in this repository. Follow it together with the product documents in `docs/`. The goal is to build the Finance Management Dashboard as a production-grade Next.js, Appwrite, Vercel, Zustand, and realtime application, not a surface-level demo.

## 1. Source of Truth

Before coding, read the relevant docs and keep them aligned with the implementation:

- `docs/PRD.md`: product objective and deliverables.
- `docs/FRD.md`: functional requirements and acceptance criteria.
- `docs/NFRD.md`: non-functional requirements for security, reliability, performance, accessibility, testing, and deployment.
- `docs/architecture-guide.md`: living architecture guide. Update this whenever implementation choices, folder structure, data flow, Appwrite setup, realtime strategy, or testing strategy changes.
- `docs/task.md`: task-by-task implementation plan and project definition of done.
- `docs/todo.md`: current working notes if present.

If code and docs disagree, stop and reconcile the mismatch. Either update the code to match the docs or update the docs with the new decision and reason.

## 2. Agent Mindset

Work as a Senior Architect and Developer:

- Think in systems, contracts, data ownership, security boundaries, failure modes, and long-term maintainability.
- Do not only make the UI appear to work. Validate inputs, handle loading/error/empty states, protect data, write tests, and document important decisions.
- Catch blind spots across features: auth/session behavior, ownership checks, Appwrite permissions, realtime cleanup, stale dashboard metrics, currency precision, mobile usability, accessibility, deployment environment variables, and test isolation.
- Review generated code before finishing. Remove duplication, tighten types, check naming, verify module boundaries, and ensure the implementation matches the architecture.
- Prefer boring, proven, production-ready patterns over clever one-off code.

## 3. Required Tech Decisions

Use the project stack intentionally:

- Next.js latest stable App Router patterns, including Server Components where practical and Client Components only where interactivity is needed.
- Next.js Server Actions for invoice create, edit, delete, and paid/unpaid status changes.
- Next.js Middleware for protected dashboard and invoice routes.
- Appwrite Auth for signup, login, logout, and session handling.
- Appwrite Database for invoice persistence.
- Appwrite Permissions for per-user document access.
- Appwrite Realtime as the default invoice realtime source.
- A typed `lib/realtime` boundary for Appwrite Realtime, SSE, and socket adapters. Use SSE for one-way event streams and sockets only for bidirectional behavior that Appwrite Realtime does not cover.
- Zustand for focused client UI state only, such as filters, dialogs, sidebar state, realtime status, and chart preferences. Do not use Zustand as the source of truth for persisted invoice data.
- React Hook Form plus Zod, or an equally mature form stack, for production form handling and validation.
- ShadCN/UI and TailwindCSS for accessible, consistent UI.
- Recharts or a maintained charting library for dashboard visualizations.
- Vercel as the deployment target.
- TypeScript strict mode throughout the app.

## 4. Architecture Rules

Use modular, feature-oriented structure. Keep route files thin and move reusable behavior into feature or library modules.

Expected structure:

```text
src/
  app/
    (auth)/
    (dashboard)/
    actions/
    middleware.ts
  components/
    layout/
    ui/
    feedback/
  features/
    auth/
    dashboard/
    invoices/
  lib/
    appwrite/
    realtime/
    validation/
    utils/
  stores/
  types/
tests/
  unit/
  integration/
  e2e/
docs/
```

Architecture boundaries:

- Server actions own trusted mutations.
- Appwrite and server-side reads own persisted business data.
- Client state owns temporary UI state only.
- Financial calculations live in domain utilities and are reused by server actions, dashboard aggregation, and tests.
- Validation schemas are shared where safe, but server actions must always validate again.
- Appwrite server/admin clients must be server-only. Never expose server API keys through `NEXT_PUBLIC_*`.
- UI components should be presentational where practical. Data access, mutations, and realtime subscriptions belong in actions, services, hooks, or feature modules.

## 5. Task Workflow

Work task by task from `docs/task.md`. For each task:

1. Read the task, related FRD/NFRD sections, and current architecture guide.
2. Identify data contracts, security requirements, edge cases, and test needs before coding.
3. Implement the smallest complete production slice.
4. Add or update unit, integration, and e2e tests appropriate to the risk.
5. Update `README.md` and `docs/architecture-guide.md` when setup, scripts, environment variables, data flow, service boundaries, or architecture choices change.
6. Run quality checks that are available for the current project stage.
7. Review your own generated code before moving to the next task.

Do not mark a task complete until code, tests, documentation, and quality checks are handled or a clear blocker is documented.

## 6. Production Depth Rules

Build the deeper production version of each feature:

- Forms must use schema validation, accessible labels, inline errors, pending states, disabled submit while pending, server-side validation, and toast feedback.
- Images must use Next.js image optimization APIs where images are needed. Do not use a plain `img` tag unless there is a documented reason.
- Tables must include responsive behavior, empty/loading/error states, accessible controls, and keyboard-friendly actions.
- Dashboard metrics and charts must use typed aggregation utilities, not duplicated ad hoc calculations in components.
- Mutations must return typed success/error results and show useful user feedback.
- Optimistic UI is allowed only when rollback and error recovery are implemented.
- Realtime subscriptions must clean up on unmount/logout and degrade gracefully if disconnected.
- Code comments should explain non-obvious domain, security, realtime, or framework decisions. Do not clutter code with comments that restate obvious syntax.

## 7. Invoice Domain Rules

The invoice model must include:

- `id`
- `userId`
- `clientName`
- `clientEmail`
- `amount`
- `vatRate`
- `vatAmount`
- `total`
- `dueDate`
- `status`
- `createdAt`
- `updatedAt`
- `paidAt`

Status values are `paid` and `unpaid`.

Financial rules:

- `vatAmount = amount * (vatRate / 100)`.
- `total = amount + vatAmount`.
- Persisted derived values must be calculated server-side.
- Client-side previews are allowed but are never the source of truth.
- Amount must be greater than zero.
- VAT rate must be constrained, recommended from `0` to `100`.
- Prefer integer minor units such as kobo for production finance accuracy. If decimals are used initially, isolate all math inside utilities so the storage strategy can evolve.
- Paid revenue and VAT summaries should count paid invoices unless the product docs define a different rule.
- Due-date and overdue logic must be timezone-aware enough to avoid incorrect user-facing states.

## 8. Appwrite, Security, and Environment Rules

Every authenticated feature must enforce both authentication and authorization:

- Middleware protects `/dashboard`, `/invoices`, and future authenticated routes.
- Server actions must read the authenticated user before every mutation.
- Server actions must verify ownership for every edit, delete, and status change.
- Never trust client-provided `userId`, `vatAmount`, `total`, permissions, or ownership-sensitive fields.
- Appwrite documents must use per-user read/write permissions.
- Authentication and Appwrite errors must be shown clearly without leaking secrets or internal details.
- Logout must clear user-sensitive client state.
- Required Appwrite collection attributes, indexes, permissions, and environment variables must be documented in `README.md` and `docs/architecture-guide.md`.

Environment rules:

- Public Appwrite endpoint/project/database/collection IDs may use `NEXT_PUBLIC_*`.
- Server API keys must never use `NEXT_PUBLIC_*`.
- Vercel environment variable setup must be documented and kept current.

## 9. Realtime, SSE, and Socket Rules

Default to Appwrite Realtime for invoice changes. Keep the UI decoupled from vendor APIs through typed hooks/services.

Requirements:

- Place realtime contracts and adapters under `lib/realtime`.
- Expose feature-level hooks such as `useInvoiceRealtime({ userId })`.
- Filter or verify events by authenticated user.
- Handle connected, reconnecting, disconnected, and error states.
- Clean up subscriptions on unmount and logout.
- Revalidate or refresh affected views after realtime changes using a documented strategy.
- Provide fallback behavior when realtime fails; CRUD must still work.
- Add SSE or socket adapters only behind the realtime boundary, with typed contracts and documentation explaining why they are needed.

## 10. Zustand Rules

Use Zustand narrowly and deliberately:

- Good: invoice filters, modal/dialog state, sidebar state, realtime connection status, temporary dashboard preferences.
- Bad: Appwrite session secrets, persisted invoice source of truth, duplicated server state without sync rules.
- Stores must be typed and modular.
- Use selectors to avoid unnecessary rerenders.
- Clear sensitive or user-scoped stores on logout.
- Test stores when they contain business-relevant behavior.

## 11. UI, UX, Accessibility, and Browser Testing

Match the Figma reference from the PRD while preserving accessibility and responsive behavior.

UI rules:

- Build actual usable screens, not placeholder landing pages.
- Use ShadCN/UI primitives where appropriate.
- Use accessible names for icon-only buttons.
- Do not rely on color alone for paid/unpaid/overdue states.
- Ensure forms, tables, dialogs, charts, and toasts are keyboard usable.
- Ensure mobile layouts remain usable, especially invoice tables and action menus.
- Include loading, empty, success, and error states.

Browser verification:

- Use Codex `@browser_use` or the browser-use plugin to inspect developed UI in the browser.
- Test desktop and mobile responsive states.
- Manually exercise every developed feature after implementation.
- For Figma-related UI work, compare against the Figma reference and adjust spacing, layout, hierarchy, and responsive behavior.
- Record any browser testing gaps in the final handoff if a local server, credentials, or environment variables are unavailable.

## 12. Testing Rules

The project must contain unit and e2e coverage. Add tests as features are built, not after the whole app is complete.

Required unit coverage:

- VAT calculation.
- Invoice total calculation.
- Dashboard metric aggregation.
- Due-date countdown and overdue logic.
- Validation schemas.
- Zustand store behavior where business-relevant.

Required integration coverage:

- Server action validation.
- Server action ownership checks.
- Appwrite service wrappers using mocks or a documented test strategy.
- Form submission success and failure states where practical.

Required e2e coverage:

- Signup or mocked authenticated session.
- Login.
- Create invoice.
- Edit invoice.
- Mark invoice paid/unpaid.
- Filter invoices.
- Delete invoice.
- Dashboard metric updates.

Quality expectations:

- Tests must be deterministic and isolated from production Appwrite data.
- CI or documented quality gates must run lint, format check, typecheck, unit tests, e2e smoke, and build.
- If a check cannot run, document why and what remains risky.

## 13. Code Quality Rules

All application code must be typed, linted, formatted, and reviewable:

- Enable TypeScript strict mode.
- Avoid implicit `any`.
- Export shared domain types from controlled locations.
- Prefer typed results for server actions:

```ts
type ActionResult<T> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
```

- Keep functions and components small enough to understand and test.
- Use clear names that express domain intent.
- Avoid duplicating business rules in component trees.
- Use standardized lint, format, import ordering, and script names.
- Do not introduce large abstractions until they remove real duplication or clarify an important boundary.
- Review generated code for dead code, unsafe defaults, incorrect async behavior, missing cleanup, missing error handling, and undocumented architecture changes.

## 14. Documentation Rules

Documentation is part of the deliverable:

- Keep `README.md` current with setup, scripts, environment variables, Appwrite setup, testing, and Vercel deployment.
- Keep `docs/architecture-guide.md` living and accurate.
- Document Appwrite collection schemas, indexes, permissions, and deployment environment variables.
- Add in-code documentation for non-obvious financial calculations, server action security boundaries, realtime lifecycle behavior, and framework/vendor workarounds.
- Do not add comments that simply narrate obvious code.

## 15. Deployment and Vercel Rules

Before deployment:

- Build passes locally.
- Lint, format check, typecheck, unit tests, and e2e smoke pass or blockers are documented.
- Vercel environment variables are configured.
- Appwrite database, collection attributes, indexes, permissions, auth provider, and realtime settings are configured.
- Production smoke test covers login, invoice creation, invoice update, paid/unpaid status, dashboard metrics, and realtime refresh.

Vercel-specific guidance:

- Use Next.js features in ways compatible with Vercel runtime constraints.
- Keep server-only code out of client bundles.
- Be deliberate with caching, route revalidation, and server actions.
- Document any runtime requirements or limitations.

## 16. Definition of Done

A feature is done only when:

- It satisfies the FRD acceptance criteria.
- It satisfies relevant NFRD requirements.
- It follows the architecture boundaries in `docs/architecture-guide.md`.
- It is typed end to end.
- It handles happy paths, edge cases, invalid input, empty states, loading states, errors, and negative paths.
- It has appropriate unit, integration, and/or e2e tests.
- It has been manually checked with `@browser_use` when UI is affected.
- It updates documentation where needed.
- It passes available lint, typecheck, test, and build checks.
- The agent has reviewed the generated code before handoff.

The whole project is done only when the app is authenticated, secure, real-time, documented, tested, deployable on Vercel, backed by Appwrite, responsive against the Figma reference, and smoke-tested end to end.
