import { redirect } from "next/navigation";

import { getDueDateState } from "@/features/invoices/lib/dates";
import {
  aggregateDashboardMetrics,
  formatNaira,
} from "@/features/invoices/lib/finance";
import { listInvoiceDocumentsByUser } from "@/lib/appwrite/database";
import { getAuthenticatedUser } from "@/lib/appwrite/session";

export const metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const result = await listInvoiceDocumentsByUser(user.$id, { limit: 100 });

  if (!result.ok) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h1 className="text-2xl font-semibold tracking-normal">
          Financial overview
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We could not load your dashboard metrics right now.
        </p>
      </div>
    );
  }

  const invoices = result.data.invoices;
  const metrics = aggregateDashboardMetrics(invoices);
  const dueSoon = invoices
    .filter((invoice) => {
      const due = getDueDateState(invoice.dueDate, invoice.status);
      return due.isDueSoon || due.isOverdue;
    })
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Financial overview
        </p>
        <h1 className="text-3xl font-semibold tracking-normal">
          Welcome back, {user.name || "there"}
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Track paid revenue, pending client balances, and VAT from the invoice
          records you own.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <section className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total invoices</p>
          <p className="mt-3 font-mono text-2xl font-semibold">
            {metrics.totalInvoices}
          </p>
        </section>
        <section className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Paid revenue</p>
          <p className="mt-3 font-mono text-2xl font-semibold">
            {formatNaira(metrics.paidRevenue)}
          </p>
        </section>
        <section className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Pending payments</p>
          <p className="mt-3 font-mono text-2xl font-semibold">
            {formatNaira(metrics.pendingPayments)}
          </p>
        </section>
        <section className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">VAT collected</p>
          <p className="mt-3 font-mono text-2xl font-semibold">
            {formatNaira(metrics.vatCollected)}
          </p>
        </section>
      </div>

      <section className="rounded-lg border bg-card p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Payment insights</h2>
            <p className="text-sm text-muted-foreground">
              Due-soon and overdue unpaid invoices are highlighted from local
              date calculations.
            </p>
          </div>
          <p className="font-mono text-sm font-semibold">
            Payable VAT this month: {formatNaira(metrics.payableVatThisMonth)}
          </p>
        </div>

        {dueSoon.length === 0 ? (
          <p className="mt-6 rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
            No unpaid invoices are due soon.
          </p>
        ) : (
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {dueSoon.map((invoice) => {
              const due = getDueDateState(invoice.dueDate, invoice.status);

              return (
                <li key={invoice.id} className="rounded-lg border p-4">
                  <p className="text-sm font-medium">{invoice.clientName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {due.label}
                  </p>
                  <p className="mt-3 font-mono text-sm font-semibold">
                    {formatNaira(invoice.total)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
