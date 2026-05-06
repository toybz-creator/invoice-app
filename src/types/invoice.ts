import type { Models } from "appwrite";

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

export type InvoiceDocumentData = Omit<Invoice, "id">;

export type AppwriteInvoiceDocument = Models.Document & InvoiceDocumentData;

export type InvoiceList = {
  invoices: Invoice[];
  total: number;
};
