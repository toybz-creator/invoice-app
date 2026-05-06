import {
  CalendarClock,
  FileText,
  MoreHorizontal,
  Receipt,
  WalletCards,
  WalletMinimal,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardCharts } from "@/features/dashboard/components/dashboard-charts";
import { buildDashboardDueInsights } from "@/features/dashboard/lib/insights";
import { StatusBadge } from "@/features/invoices/components/status-badge";
import { formatInvoiceDate } from "@/features/invoices/lib/dates";
import {
  aggregateDashboardMetrics,
  buildMonthlySummary,
  buildStatusSummary,
  formatNaira,
} from "@/features/invoices/lib/finance";
import { listInvoiceRowsByUser } from "@/lib/appwrite/database";
import { getAuthenticatedUser } from "@/lib/appwrite/session";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/types/invoice";

export const metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function metricToneClasses(featured?: boolean) {
  return featured ? "bg-[#343941] text-white" : "bg-[#fafafa] text-[#1b212d]";
}

function MetricCard({
  label,
  value,
  icon,
  featured,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  featured?: boolean;
}) {
  return (
    <section
      className={cn(
        "flex min-h-[106px] items-center gap-6 rounded-lg p-5",
        metricToneClasses(featured),
      )}
    >
      <span
        className={cn(
          "flex size-[42px] shrink-0 items-center justify-center rounded-full",
          featured
            ? "bg-white/10 text-[#c8ee44]"
            : "bg-[#f0f1f3] text-[#343941]",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm",
            featured ? "text-white/60" : "text-[#929eae]",
          )}
        >
          {label}
        </p>
        <p className="mt-2 truncate font-mono text-2xl font-bold tracking-normal">
          {value}
        </p>
      </div>
    </section>
  );
}

function invoiceCode(id: string) {
  return `MGL${id
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 6)
    .toUpperCase()}`;
}

function DashboardErrorState() {
  return (
    <div className="space-y-8">
      <h1 className="text-[28px] font-semibold tracking-normal text-[#1b212d]">
        Dashboard
      </h1>
      <section className="rounded-lg border border-[#f2f4f7] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#1b212d]">
          Financial overview unavailable
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[#929eae]">
          We could not load your dashboard metrics right now. Invoice mutations
          remain available from the invoices workspace.
        </p>
      </section>
    </div>
  );
}

function DueInsightList({
  title,
  invoices,
  tone,
}: {
  title: string;
  invoices: ReturnType<typeof buildDashboardDueInsights>["overdue"];
  tone: "danger" | "warning";
}) {
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

function RecentInvoices({ invoices }: { invoices: Invoice[] }) {
  return (
    <section className="rounded-lg bg-white p-5" aria-labelledby="recent-title">
      <div className="flex items-center justify-between gap-4">
        <h2 id="recent-title" className="text-lg font-semibold text-[#1b212d]">
          Recent Invoice
        </h2>
        <Link
          href="/invoices"
          className="text-sm font-semibold text-[#00aa78] transition hover:text-[#1b212d]"
        >
          View All
        </Link>
      </div>

      {invoices.length === 0 ? (
        <p className="mt-6 rounded-lg bg-[#fafafa] p-4 text-sm text-[#929eae]">
          Create your first invoice to populate dashboard activity.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[820px] w-full text-left">
            <thead>
              <tr className="text-xs font-bold uppercase text-[#929eae]">
                <th className="py-3 pr-4">Name/Client</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="py-3 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f4f7]">
              {invoices.slice(0, 4).map((invoice) => (
                <tr key={invoice.id} className="text-sm text-[#1b212d]">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-full bg-[#f5f5f5] text-[#00aa78]">
                        <Receipt className="size-4" />
                      </span>
                      <div>
                        <p className="font-semibold">{invoice.clientName}</p>
                        <p className="mt-1 text-xs text-[#929eae]">
                          Inv: {invoiceCode(invoice.id)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[#929eae]">
                    <span className="block font-medium text-[#1b212d]">
                      {formatInvoiceDate(invoice.$createdAt)}
                    </span>
                    Due {formatInvoiceDate(invoice.dueDate)}
                  </td>
                  <td className="px-4 py-4 font-mono text-[#929eae]">
                    {invoiceCode(invoice.id)}
                  </td>
                  <td className="px-4 py-4 font-mono font-semibold">
                    {formatNaira(invoice.total)}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td className="py-4 pl-4 text-right">
                    <Link
                      href="/invoices"
                      className="inline-flex size-9 items-center justify-center rounded-full text-[#00aa78] transition hover:bg-[#fafafa] hover:text-[#1b212d]"
                    >
                      <MoreHorizontal className="size-5" />
                      <span className="sr-only">
                        Open invoice workspace for {invoice.clientName}
                      </span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const result = await listInvoiceRowsByUser(user.$id, { limit: 500 });

  if (!result.ok) {
    return <DashboardErrorState />;
  }

  const invoices = result.data.invoices;
  const metrics = aggregateDashboardMetrics(invoices);
  const statusSummary = buildStatusSummary(invoices);
  const monthlySummary = buildMonthlySummary(invoices);
  const dueInsights = buildDashboardDueInsights(invoices);

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-semibold tracking-normal text-[#1b212d]">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-[#929eae]">
            Welcome back, {user.name || "there"}. Your financial summary is
            scoped to your invoices.
          </p>
        </div>
        <p className="text-sm font-semibold text-[#929eae]">
          {result.data.total} invoice{result.data.total === 1 ? "" : "s"} in
          Appwrite
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <MetricCard
          label="Total invoice"
          value={String(metrics.totalInvoices)}
          icon={<WalletMinimal className="size-5" />}
          featured
        />
        <MetricCard
          label="Amount Paid"
          value={formatNaira(metrics.paidRevenue)}
          icon={<WalletCards className="size-5" />}
        />
        <MetricCard
          label="Pending Payment"
          value={formatNaira(metrics.pendingPayments)}
          icon={<CalendarClock className="size-5" />}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <MetricCard
          label="Total VAT Collected"
          value={formatNaira(metrics.vatCollected)}
          icon={<Receipt className="size-5" />}
        />
        <MetricCard
          label="Monthly Payable VAT"
          value={formatNaira(metrics.payableVatThisMonth)}
          icon={<FileText className="size-5" />}
        />
      </div>

      <DashboardCharts
        statusSummary={statusSummary}
        monthlySummary={monthlySummary}
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <DueInsightList
          title="Overdue invoices"
          invoices={dueInsights.overdue}
          tone="danger"
        />
        <DueInsightList
          title="Due soon"
          invoices={dueInsights.dueSoon}
          tone="warning"
        />
      </div>

      <RecentInvoices invoices={invoices} />
    </div>
  );
}
