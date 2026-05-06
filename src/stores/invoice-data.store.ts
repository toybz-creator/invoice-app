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

/**
 * Central client-side store for invoice data.
 *
 * This store implements the "Fetch Once, Sync Everywhere" strategy.
 * It is seeded once by the dashboard layout and then kept in sync
 * via Server Action results and Appwrite Realtime events.
 */
export const useInvoiceDataStore = create<InvoiceDataState>((set) => ({
  ...initialState,
  /**
   * Performs the initial data hydration.
   */
  setInitialInvoices: ({ userId, invoices, total, loadError = null }) =>
    set({
      invoices: sortInvoices(invoices),
      total: total ?? invoices.length,
      loadError,
      initializedUserId: userId,
    }),
  /**
   * Updates or inserts an invoice in the local store.
   * Used by Server Actions to provide immediate UI feedback.
   */
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
  /**
   * Removes an invoice from the local store.
   */
  removeInvoice: (invoiceId) =>
    set((state) => {
      const exists = state.invoices.some((invoice) => invoice.id === invoiceId);

      return {
        invoices: state.invoices.filter((invoice) => invoice.id !== invoiceId),
        total: exists ? Math.max(0, state.total - 1) : state.total,
      };
    }),
  /**
   * Applies an incoming Appwrite Realtime payload to the local store.
   *
   * Logic:
   * 1. Normalizes the incoming row (handling differences between Appwrite's
   *    raw document and the application's Invoice type).
   * 2. Verifies ownership (userId) to prevent cross-user data leakage
   *    in shared browser sessions.
   * 3. Handles 'create', 'update', and 'delete' events.
   */
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
