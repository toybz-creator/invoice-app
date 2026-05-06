"use client";

import {
  BookMarked,
  Receipt,
  Wallet,
} from "lucide-react";

import { DashboardCharts } from "@/features/dashboard/components/dashboard-charts";
import { DashboardErrorState } from "@/features/dashboard/components/dashboard-error-state";
import { DashboardMetricCard } from "@/features/dashboard/components/dashboard-metric-card";
import { DashboardRecentInvoices } from "@/features/dashboard/components/dashboard-recent-invoices";
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

  return (
    <div className="space-y-8 pb-8">
      <div className="grid gap-5 xl:grid-cols-3">
        <DashboardMetricCard
          label="Total invoice"
          value={String(metrics.totalInvoices)}
          icon={<Wallet className="size-5" />}
          featured
        />
        <DashboardMetricCard
          label="Amount Paid"
          value={formatNaira(metrics.paidRevenue)}
          icon={<Wallet className="size-5" />}
        />
        <DashboardMetricCard
          label="Pending Payment"
          value={formatNaira(metrics.pendingPayments)}
          icon={<Wallet className="size-5" />}
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
          icon={<BookMarked className="size-5" />}
        />
      </div>

      <DashboardCharts
        statusSummary={statusSummary}
        monthlySummary={monthlySummary}
      />

      <DashboardRecentInvoices invoices={invoices} />
    </div>
  );
}
