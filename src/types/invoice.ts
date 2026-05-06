import type { Models } from "node-appwrite";

export const invoiceStatuses = ["paid", "unpaid"] as const;

export type InvoiceStatus = (typeof invoiceStatuses)[number];

export type Invoice = {
  id: string;
  userId: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  dueDate: string;
  status: InvoiceStatus;
  $createdAt: string;
  $updatedAt: string;
  paidAt: string | null;
};

export type InvoiceRowData = Omit<Invoice, "id" | "$createdAt" | "$updatedAt">;

export type AppwriteInvoiceRow = Models.Row & InvoiceRowData;

export type InvoiceList = {
  invoices: Invoice[];
  total: number;
};
