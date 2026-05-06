# Zustand Stores

Stores in this folder are limited to temporary UI state such as invoice filters,
dialogs, sidebar state, realtime connection status, and dashboard preferences.

`invoice-data.store.ts` is a deliberate Phase 7 exception to avoid repeated
Appwrite reads while navigating inside the authenticated dashboard shell. It is
not persisted and is not the database source of truth; it is seeded by the
layout's initial server read, then synchronized from successful server action
results and owner-filtered Appwrite Realtime events.
