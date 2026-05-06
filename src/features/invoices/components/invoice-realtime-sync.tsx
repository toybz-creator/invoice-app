"use client";

import { useInvoiceRealtime } from "@/features/invoices/hooks/use-invoice-realtime";

export function InvoiceRealtimeSync({ userId }: { userId: string }) {
  useInvoiceRealtime({ userId });
  return null;
}
