"use client";

import {
  CalendarClock,
  FileText,
  Receipt,
  WalletCards,
  WalletMinimal,
} from "lucide-react";

import { DashboardCharts } from "@/features/dashboard/components/dashboard-charts";
import { DashboardDueInsightList } from "@/features/dashboard/components/dashboard-due-insights";
import { DashboardErrorState } from "@/features/dashboard/components/dashboard-error-state";
import { DashboardMetricCard } from "@/features/dashboard/components/dashboard-metric-card";
import { DashboardRecentInvoices } from "@/features/dashboard/components/dashboard-recent-invoices";
import { buildDashboardDueInsights } from "@/features/dashboard/lib/insights";
import { useInvoiceSnapshot } from "@/features/invoices/components/invoice-data-provider";
import {
  aggregateDashboardMetrics,
  buildMonthlySummary,
  buildStatusSummary,
  formatNaira,
} from "@/features/invoices/lib/finance";

export function DashboardWorkspace() {
  const { invoices, loadError } = useInvoiceSnapshot();

  if (loadError) {
    return <DashboardErrorState message={loadError} />;
  }

  const metrics = aggregateDashboardMetrics(invoices);
  const statusSummary = buildStatusSummary(invoices);
  const monthlySummary = buildMonthlySummary(invoices);
  const dueInsights = buildDashboardDueInsights(invoices);

  return (
    <div className="space-y-8 pb-8">
      <div className="grid gap-5 xl:grid-cols-3">
        <DashboardMetricCard
          label="Total invoice"
          value={String(metrics.totalInvoices)}
          icon={<WalletMinimal className="size-5" />}
          featured
        />
        <DashboardMetricCard
          label="Amount Paid"
          value={formatNaira(metrics.paidRevenue)}
          icon={<WalletCards className="size-5" />}
        />
        <DashboardMetricCard
          label="Pending Payment"
          value={formatNaira(metrics.pendingPayments)}
          icon={<CalendarClock className="size-5" />}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <DashboardMetricCard
          label="Total VAT Collected"
          value={formatNaira(metrics.vatCollected)}
          icon={<Receipt className="size-5" />}
        />
        <DashboardMetricCard
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
        <DashboardDueInsightList
          title="Overdue invoices"
          invoices={dueInsights.overdue}
          tone="danger"
        />
        <DashboardDueInsightList
          title="Due soon"
          invoices={dueInsights.dueSoon}
          tone="warning"
        />
      </div>

      <DashboardRecentInvoices invoices={invoices} />
    </div>
  );
}
