import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-dvh bg-background text-foreground lg:grid-cols-[1fr_minmax(420px,540px)]">
      <section className="hidden border-r bg-muted/30 px-10 py-12 lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Finance Management Dashboard
          </p>
          <h2 className="mt-6 max-w-xl text-4xl font-semibold tracking-normal">
            Secure invoice workflows for growing small businesses.
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          Final auth screens will follow the Maglo Figma reference while adding
          production validation, Appwrite errors, and accessible feedback.
        </p>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        {children}
      </section>
    </main>
  );
}
