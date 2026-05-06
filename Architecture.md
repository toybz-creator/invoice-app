# Architecture

This document provides a high-level overview of the Invoice App's architecture. For a more detailed technical guide, please refer to the [Architecture Guide](file:///Users/toyeebabdulrahmon/projects/invoice-app/docs/architecture-guide.md).

## 1. Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Backend-as-a-Service**: [Appwrite](https://appwrite.io/) (Auth, Database, Realtime)
- **Deployment**: [Vercel](https://vercel.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Client-side UI state)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN/UI](https://ui.shadcn.com/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

## 2. Core Architectural Principles

1. **Server-Side Truth**: Appwrite and Server Actions own the persisted business data.
2. **Modular Features**: Code is organized by feature (Auth, Invoices, Dashboard) in `src/features/`.
3. **Security First**: Every mutation is verified through Server Actions with ownership checks.
4. **Realtime Sync**: UI stays updated via Appwrite Realtime, synchronized through a local Zustand store.

## 3. Data Flow & Synchronization

### Initial Load & Hydration
To minimize server round-trips and provide a fast, app-like experience, the application follows a **"Fetch Once, Sync Everywhere"** pattern:
- **Single Fetch**: The authenticated dashboard layout performs a single, owner-scoped fetch of all relevant invoice data from Appwrite upon initial entry.
- **Client-Side Hydration**: This data is used to hydrate a global [invoice-data.store.ts](file:///Users/toyeebabdulrahmon/projects/invoice-app/src/stores/invoice-data.store.ts) (Zustand).

### Real-time Updates (No Re-fetching)
Once the initial load is complete, the app **does not use server-side fetching** for navigation or updates. Instead:
- **Appwrite Realtime**: The app maintains a subscription to Appwrite's database events. Any changes made by the current user (or on other devices) are pushed to the client and immediately merged into the local Zustand store.
- **Server Action Integration**: Successful mutations via Server Actions return the updated data, which is immediately applied to the local store, ensuring the UI remains snappy and consistent without page refreshes.
- **Seamless Navigation**: Moving between the Dashboard and Invoices list uses the local store, resulting in instantaneous transitions with no loading states or additional network requests.

## 4. Key Layers

### Next.js App Router & Server Components
The application uses Server Components for initial data fetching and layout structure, ensuring fast initial loads and SEO-friendly rendering.

### Server Actions
All mutations (create, edit, delete, status changes) are handled by Server Actions. They act as a secure boundary, performing validation and financial calculations before interacting with Appwrite.

### Appwrite Integration
- **Auth**: Manages user sessions and identity.
- **Database**: Stores invoice data with per-user permissions.
- **Realtime**: Pushes updates to clients for live UI synchronization.

### Zustand Stores
Used for focused client-side state:
- **UI Store**: Handles filters, modal states, and sidebar toggles.
- **Data Store**: Provides a synchronized, volatile snapshot of invoice data for immediate UI updates.

## 5. Project Structure

```text
src/
  app/          # Routes, Pages, and Server Actions
  components/   # Shared UI and Layout components
  features/     # Domain-specific logic (Auth, Invoices, Dashboard)
  lib/          # System boundaries (Appwrite, Realtime, Utils)
  stores/       # Zustand state definitions
  types/        # Shared TypeScript definitions
```

## 6. Further Reading

- [Architecture Guide](file:///Users/toyeebabdulrahmon/projects/invoice-app/docs/architecture-guide.md): Deep dive into data flow, security, and implementation details.
- [PRD](file:///Users/toyeebabdulrahmon/projects/invoice-app/docs/PRD.md): Product Requirements Document.
- [FRD](file:///Users/toyeebabdulrahmon/projects/invoice-app/docs/FRD.md): Functional Requirements Document.
