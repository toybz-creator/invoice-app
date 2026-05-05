export const metadata = {
  title: "Invoices",
};

export default function InvoicesPage() {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">
        Invoices shell
      </p>
      <h1 className="text-3xl font-semibold tracking-normal">Invoices</h1>
      <p className="max-w-2xl text-muted-foreground">
        Invoice creation, filtering, realtime status, and table actions are
        scheduled for the invoice phases. This route exists to anchor the app
        structure early.
      </p>
    </div>
  );
}
