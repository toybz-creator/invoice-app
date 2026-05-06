"use client";

import { create } from "zustand";

import type { InvoiceStatus } from "@/types/invoice";

export type InvoiceFilter = "all" | InvoiceStatus;

type InvoiceUiState = {
  filter: InvoiceFilter;
  search: string;
  page: number;
  pageSize: number;
  createOpen: boolean;
  viewingInvoiceId: string | null;
  editingInvoiceId: string | null;
  deletingInvoiceId: string | null;
  actionMenuInvoiceId: string | null;
  setFilter: (filter: InvoiceFilter) => void;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  openCreate: () => void;
  closeCreate: () => void;
  openView: (invoiceId: string) => void;
  closeView: () => void;
  openEdit: (invoiceId: string) => void;
  closeEdit: () => void;
  openDelete: (invoiceId: string) => void;
  closeDelete: () => void;
  toggleActionMenu: (invoiceId: string) => void;
  closeActionMenu: () => void;
  resetInvoiceUi: () => void;
};

const initialState = {
  filter: "all" as InvoiceFilter,
  search: "",
  page: 1,
  pageSize: 8,
  createOpen: false,
  viewingInvoiceId: null,
  editingInvoiceId: null,
  deletingInvoiceId: null,
  actionMenuInvoiceId: null,
};

export const useInvoiceUiStore = create<InvoiceUiState>((set) => ({
  ...initialState,
  setFilter: (filter) => set({ filter, page: 1, actionMenuInvoiceId: null }),
  setSearch: (search) => set({ search, page: 1, actionMenuInvoiceId: null }),
  setPage: (page) => set({ page, actionMenuInvoiceId: null }),
  setPageSize: (pageSize) =>
    set({ pageSize, page: 1, actionMenuInvoiceId: null }),
  openCreate: () => set({ createOpen: true, actionMenuInvoiceId: null }),
  closeCreate: () => set({ createOpen: false }),
  openView: (viewingInvoiceId) =>
    set({ viewingInvoiceId, actionMenuInvoiceId: null }),
  closeView: () => set({ viewingInvoiceId: null }),
  openEdit: (editingInvoiceId) =>
    set({ editingInvoiceId, actionMenuInvoiceId: null }),
  closeEdit: () => set({ editingInvoiceId: null }),
  openDelete: (deletingInvoiceId) =>
    set({ deletingInvoiceId, actionMenuInvoiceId: null }),
  closeDelete: () => set({ deletingInvoiceId: null }),
  toggleActionMenu: (invoiceId) =>
    set((state) => ({
      actionMenuInvoiceId:
        state.actionMenuInvoiceId === invoiceId ? null : invoiceId,
    })),
  closeActionMenu: () => set({ actionMenuInvoiceId: null }),
  resetInvoiceUi: () => set(initialState),
}));
