import type { buildDashboardDueInsights } from "@/features/dashboard/lib/insights";
import { formatNaira } from "@/features/invoices/lib/finance";
import { cn } from "@/lib/utils";

type DashboardDueInsightListProps = {
  title: string;
  invoices: ReturnType<typeof buildDashboardDueInsights>["overdue"];
  tone: "danger" | "warning";
};

export function DashboardDueInsightList({
  title,
  invoices,
  tone,
}: DashboardDueInsightListProps) {
  return (
    <section className="rounded-lg border border-[#f2f4f7] bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-[#1b212d]">{title}</h2>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            tone === "danger"
              ? "bg-[#ffefef] text-[#eb5757]"
              : "bg-[#fff7e8] text-[#f2994a]",
          )}
        >
          {invoices.length}
        </span>
      </div>

      {invoices.length === 0 ? (
        <p className="mt-5 rounded-lg bg-[#fafafa] p-4 text-sm text-[#929eae]">
          No unpaid invoices in this group.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {invoices.slice(0, 4).map(({ invoice, due }) => (
            <li
              key={invoice.id}
              className={cn(
                "rounded-lg border p-4",
                tone === "danger"
                  ? "border-[#ffdfdf] bg-[#fffafa]"
                  : "border-[#ffe9c7] bg-[#fffdf8]",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#1b212d]">
                    {invoice.clientName}
                  </p>
                  <p className="mt-1 text-xs text-[#929eae]">{due.label}</p>
                </div>
                <p className="shrink-0 font-mono text-sm font-semibold text-[#1b212d]">
                  {formatNaira(invoice.total)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
