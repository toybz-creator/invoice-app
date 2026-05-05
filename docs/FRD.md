# Functional Requirements Document

## 1. Product Summary

The Finance Management Dashboard is a production-ready Next.js web application for small business owners to manage invoices, track paid and pending revenue, calculate VAT, and see financial summaries in real time.

The product uses Appwrite for authentication, database, permissions, and realtime subscriptions; Next.js for the application, routing, middleware, server actions, and rendering; Zustand for focused client state; and Vercel for deployment.

## 2. Goals

- Allow a business owner to sign up, sign in, and access a protected finance dashboard.
- Allow authenticated users to create, edit, delete, filter, and mark invoices as paid or unpaid.
- Automatically calculate VAT amount, invoice total, revenue totals, pending totals, and VAT summaries.
- Provide live dashboard updates when invoice data changes.
- Deliver a responsive, accessible, documented, tested, and modular production application.

## 3. User Roles

### 3.1 Business Owner

The primary user who owns invoice data.

Capabilities:

- Create an account.
- Log in and log out.
- View only their own invoices and dashboard metrics.
- Create, update, delete, and filter invoices.
- Mark invoices as paid or unpaid.
- View VAT and payment insights.

### 3.2 Anonymous Visitor

An unauthenticated user.

Capabilities:

- View login and signup screens.
- Cannot access dashboard or invoice routes.
- Is redirected to authentication when attempting protected access.

## 4. Authentication Requirements

### AUTH-001: Signup

Users must be able to create an account using Appwrite Auth.

Required fields:

- Name
- Email
- Password

Validation:

- Name is required.
- Email must be valid.
- Password must meet configured security rules.
- Duplicate email errors must be displayed clearly.

Acceptance criteria:

- A successful signup creates an Appwrite user.
- The user is signed in or redirected to login based on implementation choice.
- Errors are displayed inline and with a toast where appropriate.

### AUTH-002: Login

Users must be able to log in using email and password.

Acceptance criteria:

- Successful login creates an Appwrite session.
- User is redirected to `/dashboard`.
- Invalid credentials show a clear error.
- Login form uses a form library, schema validation, loading states, and disabled submit while pending.

### AUTH-003: Logout

Users must be able to log out.

Acceptance criteria:

- Current Appwrite session is deleted.
- Protected client state is cleared.
- User is redirected to `/login`.

### AUTH-004: Protected Routes

Next.js Middleware must protect dashboard routes.

Protected route groups:

- `/dashboard`
- `/invoices`
- Any future authenticated app route

Acceptance criteria:

- Anonymous users are redirected to `/login`.
- Authenticated users visiting `/login` or `/signup` may be redirected to `/dashboard`.
- Middleware uses secure session handling compatible with Vercel.

## 5. Dashboard Requirements

### DASH-001: Overview Metrics

The dashboard must display:

- Total invoices created
- Total amount paid
- Pending payments
- Total VAT collected
- Total payable VAT for the selected month

Acceptance criteria:

- Metrics are scoped to the authenticated user.
- Metrics update after invoice create, edit, delete, and status changes.
- Amounts are formatted as Nigerian Naira.

### DASH-002: Charts

The dashboard must include charts using Recharts or an equivalent maintained charting library.

Required charts:

- Paid versus unpaid invoice summary
- Monthly revenue or monthly VAT trend

Acceptance criteria:

- Charts are responsive.
- Empty states are shown when there is no invoice data.
- Chart data is derived from typed domain utilities, not duplicated ad hoc calculations in the component tree.

### DASH-003: Alerts and Insights

The dashboard must highlight:

- Overdue unpaid invoices
- Invoices due soon
- Total unpaid exposure

Acceptance criteria:

- Due-date countdowns are displayed for unpaid invoices.
- Overdue invoices use a distinct visual state.
- Date logic is tested.

## 6. Invoice Requirements

### INV-001: Invoice Model

Each invoice must contain:

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

Status values:

- `paid`
- `unpaid`

Derived values:

- `vatAmount = amount * (vatRate / 100)`
- `total = amount + vatAmount`

Acceptance criteria:

- Derived values are calculated server-side before persistence.
- Client-side preview calculations may exist but cannot be the source of truth.
- All invoice types are represented with TypeScript interfaces or schemas.

### INV-002: Create Invoice

Users must be able to create invoices through a validated form.

Required fields:

- Client name
- Client email
- Amount
- VAT percentage
- Due date
- Status

Acceptance criteria:

- Uses a production form stack such as React Hook Form with Zod.
- Shows inline validation messages.
- Prevents invalid amount, VAT, email, and due-date input.
- Uses a Next.js Server Action for persistence.
- Stores invoice data in Appwrite Database.
- Shows a success or error toast.
- Revalidates relevant routes or updates realtime state after success.

### INV-003: Edit Invoice

Users must be able to edit an existing invoice.

Acceptance criteria:

- Existing values are prefilled.
- Server action validates ownership and input.
- VAT and total are recalculated after updates.
- Updating status to paid sets `paidAt` when appropriate.
- Updating status back to unpaid clears or preserves `paidAt` according to a documented domain rule.

### INV-004: Delete Invoice

Users must be able to delete invoices.

Acceptance criteria:

- Delete action requires confirmation.
- Server action validates ownership.
- Successful deletion updates dashboard metrics and invoice table.
- Errors are displayed without losing the current view.

### INV-005: Mark Paid or Unpaid

Users must be able to change invoice payment status quickly from the table or invoice detail.

Acceptance criteria:

- Uses a Next.js Server Action.
- Paid invoices update revenue and VAT summaries.
- UI uses optimistic feedback only when rollback handling is implemented.
- Realtime updates keep other open tabs in sync.

### INV-006: Invoice Table

Users must be able to view all invoices in a table.

Columns:

- Client
- Email
- Amount
- VAT
- Total
- Due date
- Status
- Actions

Filters:

- All
- Paid
- Unpaid

Acceptance criteria:

- Table is responsive.
- Mobile layout remains usable.
- Empty states are clear.
- Loading and error states are handled.
- Actions are accessible by keyboard.

## 7. Realtime Requirements

### RT-001: Appwrite Realtime

The app must subscribe to Appwrite realtime invoice changes for the authenticated user.

Acceptance criteria:

- Creates, updates, and deletes refresh relevant UI without manual reload.
- Subscription is cleaned up on unmount or logout.
- Realtime events are filtered by user ownership.

### RT-002: Server-Sent Events or Socket Layer

SSE or Socket support must be included as an internal realtime abstraction when useful for application events not covered cleanly by Appwrite Realtime.

Recommended implementation:

- Create a `realtime` service module with adapters for Appwrite Realtime and optional SSE/socket channels.
- Use SSE for one-way server-to-client notifications such as long-running import/export progress.
- Use sockets only if bidirectional collaboration, presence, or richer live interactions are added.

Acceptance criteria:

- Realtime implementation is abstracted behind typed functions/hooks.
- The app does not couple UI components directly to vendor-specific realtime APIs.
- Fallback behavior exists when realtime connection fails.

## 8. State Management Requirements

### STATE-001: Zustand Usage

Zustand must be used for client UI state that benefits from shared access.

Approved state examples:

- Active invoice filter
- Sidebar state
- Modal state
- Realtime connection status
- Lightweight dashboard preferences

Not approved:

- Treating Zustand as the source of truth for persisted invoice data.
- Duplicating server state without a clear synchronization strategy.

Acceptance criteria:

- Stores are modular and typed.
- Store selectors are used to reduce unnecessary renders.
- Server data remains owned by Appwrite and Next.js data fetching/server actions.

## 9. Notification Requirements

The app must display toast notifications for:

- Successful invoice create/update/delete
- Failed invoice operations
- Authentication success/failure where useful
- Realtime reconnect or failure states when user action is needed

Acceptance criteria:

- Toast messages are concise.
- Errors also appear near the affected form or action when appropriate.

## 10. Documentation Requirements

The project must include:

- `README.md` with setup, environment variables, scripts, deployment, and testing instructions.
- `docs/architecture-guide.md` explaining the architecture, modules, data flow, and service choices.
- In-code documentation for non-obvious logic, especially server actions, realtime adapters, security boundaries, and financial calculations.

## 11. Out of Scope for Initial Release

- Full accounting ledger.
- Multi-business organization management.
- PDF invoice generation.
- Payment gateway integration.
- Expense management.
- Complex tax rules beyond simple VAT calculation.
- Role-based staff access.

These can be added after the core invoice and dashboard experience is stable.
