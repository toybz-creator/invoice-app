"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  type InvoiceRealtimeStatus,
  useInvoiceDataStore,
} from "@/stores/invoice-data.store";

const statusConfig: Record<
  InvoiceRealtimeStatus,
  { label: string; description: string; className: string }
> = {
  connected: {
    label: "Realtime connected",
    description: "Invoice changes will update live.",
    className: "bg-[#1ba37b]",
  },
  reconnecting: {
    label: "Realtime reconnecting",
    description: "Live updates are reconnecting. Invoice actions still work.",
    className: "bg-[#f2994a]",
  },
  disconnected: {
    label: "Realtime disconnected",
    description: "Live updates are paused. Refresh if the status persists.",
    className: "bg-[#929eae]",
  },
  error: {
    label: "Realtime connection issue",
    description: "Live updates hit a connection issue and will retry.",
    className: "bg-[#eb5757]",
  },
};

export function RealtimeStatusIndicator({
  announce = true,
}: {
  announce?: boolean;
}) {
  const realtimeStatus = useInvoiceDataStore((state) => state.realtimeStatus);
  const previousStatus = useRef<InvoiceRealtimeStatus | null>(null);
  const config = statusConfig[realtimeStatus];

  useEffect(() => {
    if (!announce) {
      return;
    }

    if (previousStatus.current === realtimeStatus) {
      return;
    }

    if (previousStatus.current === null && realtimeStatus === "disconnected") {
      previousStatus.current = realtimeStatus;
      return;
    }

    previousStatus.current = realtimeStatus;

    if (realtimeStatus === "connected") {
      toast.success(config.label, { description: config.description });
      return;
    }

    if (realtimeStatus === "error") {
      toast.error(config.label, { description: config.description });
      return;
    }

    toast.info(config.label, { description: config.description });
  }, [announce, config.description, config.label, realtimeStatus]);

  return (
    <span
      className="inline-flex size-7 items-center justify-center rounded-full bg-[#fafafa]"
      title={config.label}
      aria-label={config.label}
    >
      <span
        className={cn(
          "size-2.5 rounded-full shadow-[0_0_0_4px_rgba(200,238,68,0.18)]",
          "animate-pulse",
          config.className,
        )}
      />
    </span>
  );
}
