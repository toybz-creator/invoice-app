import {
  type DueDateState,
  getDueDateState,
} from "@/features/invoices/lib/dates";
import type { Invoice } from "@/types/invoice";

export type InvoiceDueInsight = {
  invoice: Invoice;
  due: DueDateState;
};

export type DashboardDueInsights = {
  overdue: InvoiceDueInsight[];
  dueSoon: InvoiceDueInsight[];
};

export function buildDashboardDueInsights(
  invoices: Invoice[],
  now = new Date(),
): DashboardDueInsights {
  const insights = invoices
    .filter((invoice) => invoice.status === "unpaid")
    .map((invoice) => ({
      invoice,
      due: getDueDateState(invoice.dueDate, invoice.status, now),
    }))
    .filter(({ due }) => due.isOverdue || due.isDueSoon)
    .sort((first, second) => {
      if (first.due.isOverdue !== second.due.isOverdue) {
        return first.due.isOverdue ? -1 : 1;
      }

      return first.due.daysUntilDue - second.due.daysUntilDue;
    });

  return {
    overdue: insights.filter(({ due }) => due.isOverdue),
    dueSoon: insights.filter(({ due }) => due.isDueSoon),
  };
}
