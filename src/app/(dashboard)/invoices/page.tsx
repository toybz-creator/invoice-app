import { redirect } from "next/navigation";

import { InvoicesWorkspace } from "@/features/invoices/components/invoices-workspace";
import { listInvoiceDocumentsByUser } from "@/lib/appwrite/database";
import { getAuthenticatedUser } from "@/lib/appwrite/session";

export const metadata = {
  title: "Invoices",
};

export default async function InvoicesPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const result = await listInvoiceDocumentsByUser(user.$id, { limit: 100 });

  if (!result.ok) {
    return (
      <InvoicesWorkspace
        invoices={[]}
        loadError="We could not load your invoices right now. Refresh the page or try again shortly."
      />
    );
  }

  return <InvoicesWorkspace invoices={result.data.invoices} />;
}
