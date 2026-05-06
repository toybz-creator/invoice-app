# Server Actions

Trusted mutations belong here. Invoice create, edit, delete, and status updates
will validate input, verify the authenticated Appwrite user, calculate derived
financial values server-side, and return typed results that client workspaces use
to update the browser-session invoice snapshot. Full route refreshes are reserved
for auth/session transitions, not ordinary invoice CRUD.
