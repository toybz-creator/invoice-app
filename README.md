# invoice-app

Finance Management Dashboard built with Next.js, Appwrite, Zustand, ShadCN/UI, TailwindCSS, and Vercel.

## Design Workflow

The Maglo Financial Management Web UI Kit Figma frames are the UI source of truth for sign in, sign up, dashboard, invoice list, and invoice detail screens.

Before building or materially changing those screens, use the Codex `@Figma` plugin to fetch the exact frame's structured design context, capture a screenshot, and identify required assets. Translate the result into the app's Next.js, ShadCN/UI, TailwindCSS, TypeScript, and accessibility conventions, then verify desktop and mobile UI against the Figma screenshot when the local app can run.

Record any inaccessible Figma frame, missing asset, or visual verification gap in the implementation handoff and update `docs/architecture-guide.md` when it affects reusable UI or architecture decisions.
