"use client";

import { createContext, type ReactNode, useContext, useEffect } from "react";

import { InvoiceRealtimeSync } from "@/features/invoices/components/invoice-realtime-sync";
import { useInvoiceDataStore } from "@/stores/invoice-data.store";
import type { Invoice } from "@/types/invoice";

type InvoiceDataProviderProps = {
  userId: string;
  initialInvoices: Invoice[];
  total?: number;
  loadError?: string | null;
  children: ReactNode;
};

type InitialInvoiceData = Omit<InvoiceDataProviderProps, "children">;

const InvoiceDataContext = createContext<InitialInvoiceData | null>(null);

export function InvoiceDataProvider({
  userId,
  initialInvoices,
  total,
  loadError = null,
  children,
}: InvoiceDataProviderProps) {
  const setInitialInvoices = useInvoiceDataStore(
    (state) => state.setInitialInvoices,
  );

  useEffect(() => {
    setInitialInvoices({ userId, invoices: initialInvoices, total, loadError });
  }, [initialInvoices, loadError, setInitialInvoices, total, userId]);

  return (
    <InvoiceDataContext.Provider
      value={{ userId, initialInvoices, total, loadError }}
    >
      <InvoiceRealtimeSync userId={userId} />
      {children}
    </InvoiceDataContext.Provider>
  );
}

export function useInvoiceSnapshot() {
  const initialData = useContext(InvoiceDataContext);
  const invoices = useInvoiceDataStore((state) => state.invoices);
  const total = useInvoiceDataStore((state) => state.total);
  const loadError = useInvoiceDataStore((state) => state.loadError);
  const initializedUserId = useInvoiceDataStore(
    (state) => state.initializedUserId,
  );
  const realtimeStatus = useInvoiceDataStore((state) => state.realtimeStatus);
  const upsertInvoice = useInvoiceDataStore((state) => state.upsertInvoice);
  const removeInvoice = useInvoiceDataStore((state) => state.removeInvoice);

  if (initialData && initializedUserId !== initialData.userId) {
    return {
      invoices: initialData.initialInvoices,
      total: initialData.total ?? initialData.initialInvoices.length,
      loadError: initialData.loadError ?? null,
      realtimeStatus,
      upsertInvoice,
      removeInvoice,
    };
  }

  return {
    invoices,
    total,
    loadError,
    realtimeStatus,
    upsertInvoice,
    removeInvoice,
  };
}
