"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

import { getPublicAppwriteConfig } from "@/lib/appwrite/config";
import { createAppwriteRealtimeAdapter } from "@/lib/realtime/appwrite-adapter";
import type { RealtimePayload } from "@/lib/realtime/types";
import { useInvoiceDataStore } from "@/stores/invoice-data.store";
import type { AppwriteInvoiceRow, Invoice } from "@/types/invoice";

type UseInvoiceRealtimeOptions = {
  userId: string;
  onEvent?: (payload: RealtimePayload<Invoice | AppwriteInvoiceRow>) => void;
};

export function useInvoiceRealtime({
  userId,
  onEvent,
}: UseInvoiceRealtimeOptions) {
  const applyRealtimePayload = useInvoiceDataStore(
    (state) => state.applyRealtimePayload,
  );
  const realtimeStatus = useInvoiceDataStore((state) => state.realtimeStatus);
  const setRealtimeStatus = useInvoiceDataStore(
    (state) => state.setRealtimeStatus,
  );
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const handlePayload = useCallback(
    (payload: RealtimePayload<Invoice | AppwriteInvoiceRow>) => {
      const invoice =
        "id" in payload.data
          ? payload.data
          : { ...payload.data, id: payload.data.$id };

      if (invoice.userId !== userId) {
        return;
      }

      applyRealtimePayload(payload, userId);
      onEventRef.current?.(payload);

      const action =
        payload.type === "create"
          ? "created"
          : payload.type === "update"
            ? "updated"
            : "deleted";

      toast.info(`Invoice ${action}`, {
        description: `Client: ${invoice.clientName}`,
      });
    },
    [applyRealtimePayload, userId],
  );

  useEffect(() => {
    let stopped = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let subscription: { unsubscribe: () => void } | null = null;
    let retryCount = 0;
    const config = getPublicAppwriteConfig();
    const channel = `databases.${config.databaseId}.tables.${config.invoicesTableId}.rows`;

    function scheduleReconnect() {
      if (stopped) {
        return;
      }

      subscription?.unsubscribe();
      subscription = null;
      retryCount += 1;
      setRealtimeStatus(retryCount === 1 ? "error" : "reconnecting");

      retryTimer = setTimeout(
        connect,
        Math.min(30000, 1000 * 2 ** Math.min(retryCount, 5)),
      );
    }

    function connect() {
      if (stopped) {
        return;
      }

      try {
        setRealtimeStatus(retryCount > 0 ? "reconnecting" : "disconnected");
        const adapter = createAppwriteRealtimeAdapter();
        subscription = adapter.subscribe<Invoice | AppwriteInvoiceRow>(
          channel,
          (payload) => {
            retryCount = 0;
            setRealtimeStatus("connected");
            handlePayload(payload);
          },
          { onError: scheduleReconnect },
        );
        setRealtimeStatus("connected");
      } catch {
        scheduleReconnect();
      }
    }

    function reconnectAfterBrowserWake() {
      if (document.visibilityState === "visible" || navigator.onLine) {
        scheduleReconnect();
      }
    }

    connect();
    window.addEventListener("online", scheduleReconnect);
    document.addEventListener("visibilitychange", reconnectAfterBrowserWake);

    return () => {
      stopped = true;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      subscription?.unsubscribe();
      window.removeEventListener("online", scheduleReconnect);
      document.removeEventListener(
        "visibilitychange",
        reconnectAfterBrowserWake,
      );
      setRealtimeStatus("disconnected");
    };
  }, [handlePayload, setRealtimeStatus, userId]);

  return {
    isConnected: realtimeStatus === "connected",
    status: realtimeStatus,
  };
}
