import type { Invoice, InvoiceStatus } from "@/types/invoice";

export type InvoiceFinancials = {
  amount: number;
  vatRate: number;
  vatAmount: number;
  total: number;
};

export type DashboardMetrics = {
  totalInvoices: number;
  paidRevenue: number;
  pendingPayments: number;
  vatCollected: number;
  payableVatThisMonth: number;
  paidCount: number;
  unpaidCount: number;
};

export type StatusSummaryPoint = {
  status: InvoiceStatus;
  count: number;
  total: number;
};

export type MonthlySummaryPoint = {
  month: string;
  revenue: number;
  vat: number;
};

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2,
});

/**
 * Rounds a number to 2 decimal places using Number.EPSILON to avoid
 * common floating point rounding issues (e.g., 1.005 rounding incorrectly).
 *
 * All financial values in the app should pass through this or a
 * utility that calls this.
 */
function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateVatAmount(amount: number, vatRate: number) {
  return roundCurrency(amount * (vatRate / 100));
}

export function calculateInvoiceTotal(amount: number, vatRate: number) {
  return roundCurrency(amount + calculateVatAmount(amount, vatRate));
}

/**
 * Calculates VAT and Total for an invoice amount and rate.
 *
 * This is the central source of truth for invoice financial calculations.
 * It is used by both Server Actions (for persistence) and client components
 * (for previews).
 */
export function calculateInvoiceFinancials(
  amount: number,
  vatRate: number,
): InvoiceFinancials {
  const normalizedAmount = roundCurrency(amount);
  const normalizedVatRate = roundCurrency(vatRate);
  const vatAmount = calculateVatAmount(normalizedAmount, normalizedVatRate);

  return {
    amount: normalizedAmount,
    vatRate: normalizedVatRate,
    vatAmount,
    total: roundCurrency(normalizedAmount + vatAmount),
  };
}

export function formatNaira(amount: number) {
  return currencyFormatter.format(amount);
}

export function aggregateDashboardMetrics(
  invoices: Invoice[],
  now = new Date(),
): DashboardMetrics {
  const month = now.getMonth();
  const year = now.getFullYear();

  return invoices.reduce<DashboardMetrics>(
    (metrics, invoice) => {
      metrics.totalInvoices += 1;

      if (invoice.status === "paid") {
        metrics.paidRevenue = roundCurrency(
          metrics.paidRevenue + invoice.total,
        );
        metrics.vatCollected = roundCurrency(
          metrics.vatCollected + invoice.vatAmount,
        );
        metrics.paidCount += 1;

        const paidDate = invoice.paidAt ? new Date(invoice.paidAt) : null;

        if (
          paidDate &&
          paidDate.getMonth() === month &&
          paidDate.getFullYear() === year
        ) {
          metrics.payableVatThisMonth = roundCurrency(
            metrics.payableVatThisMonth + invoice.vatAmount,
          );
        }
      } else {
        metrics.pendingPayments = roundCurrency(
          metrics.pendingPayments + invoice.total,
        );
        metrics.unpaidCount += 1;
      }

      return metrics;
    },
    {
      totalInvoices: 0,
      paidRevenue: 0,
      pendingPayments: 0,
      vatCollected: 0,
      payableVatThisMonth: 0,
      paidCount: 0,
      unpaidCount: 0,
    },
  );
}

export function buildStatusSummary(invoices: Invoice[]): StatusSummaryPoint[] {
  const metrics = aggregateDashboardMetrics(invoices);

  return [
    { status: "paid", count: metrics.paidCount, total: metrics.paidRevenue },
    {
      status: "unpaid",
      count: metrics.unpaidCount,
      total: metrics.pendingPayments,
    },
  ];
}

export function buildMonthlySummary(
  invoices: Invoice[],
): MonthlySummaryPoint[] {
  const monthly = new Map<string, MonthlySummaryPoint>();

  for (const invoice of invoices) {
    if (invoice.status !== "paid") {
      continue;
    }

    const paidDate = invoice.paidAt
      ? new Date(invoice.paidAt)
      : new Date(invoice.$updatedAt);
    const key = `${paidDate.getFullYear()}-${String(
      paidDate.getMonth() + 1,
    ).padStart(2, "0")}`;

    const current = monthly.get(key) ?? { month: key, revenue: 0, vat: 0 };

    monthly.set(key, {
      month: key,
      revenue: roundCurrency(current.revenue + invoice.total),
      vat: roundCurrency(current.vat + invoice.vatAmount),
    });
  }

  return Array.from(monthly.values()).sort((a, b) =>
    a.month.localeCompare(b.month),
  );
}
