export const metadata = {
  title: "Dashboard",
};

const metricPlaceholders = [
  "Total invoices",
  "Paid revenue",
  "Pending payments",
  "VAT collected",
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Dashboard shell
        </p>
        <h1 className="text-3xl font-semibold tracking-normal">
          Financial overview
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          This Phase 1 route verifies the protected app layout target. Live
          metrics, charts, and invoice summaries are implemented in later
          dashboard phases.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricPlaceholders.map((label) => (
          <section key={label} className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-3 font-mono text-2xl font-semibold">--</p>
          </section>
        ))}
      </div>
    </div>
  );
}
