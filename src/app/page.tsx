import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-10 px-6 py-16 sm:px-8 lg:px-10">
        <div className="max-w-3xl space-y-6">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Finance Management Dashboard
          </p>
          <h1 className="text-4xl font-semibold tracking-normal text-balance sm:text-5xl">
            Manage invoices, VAT, and payment status from one secure dashboard.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            Phase 1 establishes the Next.js App Router foundation for the
            Appwrite-backed finance application. Authentication, invoice
            persistence, realtime updates, and Maglo-aligned screens are built
            from the local design references as the product matures.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">View dashboard shell</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
