"use client";

import { create } from "zustand";

import type { RealtimePayload } from "@/lib/realtime/types";
import type { AppwriteInvoiceRow, Invoice } from "@/types/invoice";

export type InvoiceRealtimeStatus =
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";

type InvoiceDataState = {
  invoices: Invoice[];
  total: number;
  loadError: string | null;
  initializedUserId: string | null;
  realtimeStatus: InvoiceRealtimeStatus;
  setInitialInvoices: (input: {
    userId: string;
    invoices: Invoice[];
    total?: number;
    loadError?: string | null;
  }) => void;
  upsertInvoice: (invoice: Invoice) => void;
  removeInvoice: (invoiceId: string) => void;
  applyRealtimePayload: (
    payload: RealtimePayload<Invoice | AppwriteInvoiceRow>,
    userId: string,
  ) => void;
  setRealtimeStatus: (status: InvoiceRealtimeStatus) => void;
  resetInvoiceData: () => void;
};

const initialState = {
  invoices: [] as Invoice[],
  total: 0,
  loadError: null as string | null,
  initializedUserId: null as string | null,
  realtimeStatus: "disconnected" as InvoiceRealtimeStatus,
};

function sortInvoices(invoices: Invoice[]) {
  return [...invoices].sort(
    (first, second) =>
      new Date(second.$createdAt).getTime() -
      new Date(first.$createdAt).getTime(),
  );
}

function normalizeRealtimeInvoice(row: Invoice | AppwriteInvoiceRow): Invoice {
  return {
    id: "id" in row ? row.id : row.$id,
    userId: row.userId,
    clientName: row.clientName,
    clientEmail: row.clientEmail,
    amount: row.amount,
    vatRate: row.vatRate,
    vatAmount: row.vatAmount,
    total: row.total,
    dueDate: row.dueDate,
    status: row.status,
    $createdAt: row.$createdAt,
    $updatedAt: row.$updatedAt,
    paidAt: row.paidAt,
  };
}

export const useInvoiceDataStore = create<InvoiceDataState>((set) => ({
  ...initialState,
  setInitialInvoices: ({ userId, invoices, total, loadError = null }) =>
    set({
      invoices: sortInvoices(invoices),
      total: total ?? invoices.length,
      loadError,
      initializedUserId: userId,
    }),
  upsertInvoice: (invoice) =>
    set((state) => {
      const exists = state.invoices.some((item) => item.id === invoice.id);
      const invoices = exists
        ? state.invoices.map((item) =>
            item.id === invoice.id ? invoice : item,
          )
        : [invoice, ...state.invoices];

      return {
        invoices: sortInvoices(invoices),
        total: exists ? state.total : state.total + 1,
        loadError: null,
      };
    }),
  removeInvoice: (invoiceId) =>
    set((state) => {
      const exists = state.invoices.some((invoice) => invoice.id === invoiceId);

      return {
        invoices: state.invoices.filter((invoice) => invoice.id !== invoiceId),
        total: exists ? Math.max(0, state.total - 1) : state.total,
      };
    }),
  applyRealtimePayload: (payload, userId) =>
    set((state) => {
      const invoice = normalizeRealtimeInvoice(payload.data);

      if (invoice.userId !== userId) {
        return state;
      }

      if (payload.type === "delete") {
        const exists = state.invoices.some((item) => item.id === invoice.id);

        return {
          invoices: state.invoices.filter((item) => item.id !== invoice.id),
          total: exists ? Math.max(0, state.total - 1) : state.total,
        };
      }

      const exists = state.invoices.some((item) => item.id === invoice.id);
      const invoices = exists
        ? state.invoices.map((item) =>
            item.id === invoice.id ? invoice : item,
          )
        : [invoice, ...state.invoices];

      return {
        invoices: sortInvoices(invoices),
        total: exists ? state.total : state.total + 1,
        loadError: null,
      };
    }),
  setRealtimeStatus: (realtimeStatus) => set({ realtimeStatus }),
  resetInvoiceData: () => set(initialState),
}));
