import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { InvoiceDataProvider } from "@/features/invoices/components/invoice-data-provider";
import { listInvoiceRowsByUser } from "@/lib/appwrite/database";
import { getAuthenticatedUser } from "@/lib/appwrite/session";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const result = await listInvoiceRowsByUser(user.$id, { limit: 500 });
  const initialInvoices = result.ok ? result.data.invoices : [];
  const total = result.ok ? result.data.total : 0;
  const loadError = result.ok
    ? null
    : "We could not load your invoices right now. Refresh the page or try again shortly.";

  return (
    <DashboardShell>
      <InvoiceDataProvider
        userId={user.$id}
        initialInvoices={initialInvoices}
        total={total}
        loadError={loadError}
      >
        {children}
      </InvoiceDataProvider>
    </DashboardShell>
  );
}
