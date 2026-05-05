# Shared Types

Cross-feature TypeScript contracts live here. Domain-specific types should stay
inside their feature until they need to be shared.

- `invoice.ts` defines the invoice domain shape expected by Appwrite and the
  rest of the app.
- `result.ts` defines typed success/error results for infrastructure helpers.
