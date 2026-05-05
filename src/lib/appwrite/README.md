# Appwrite Boundary

Browser-safe and server-only Appwrite clients live here. Server/admin SDK
clients are initialized lazily with `node-appwrite` and must never expose server
API keys through `NEXT_PUBLIC_*` variables.

- `config.ts`: validates public and server Appwrite environment variables.
- `client.ts`: browser-safe `appwrite` client, account, and database helpers.
- `admin.ts`: server-only admin client using `APPWRITE_API_KEY`.
- `permissions.ts`: per-user invoice document permissions.
- `database.ts`: typed invoice document helpers with ownership checks for
  document-level reads, updates, and deletes.
