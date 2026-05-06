import { getBrowserRealtime } from "@/lib/appwrite/client";

import type {
  RealtimeAdapter,
  RealtimeCallback,
  RealtimeEventType,
  RealtimeSubscribeOptions,
  RealtimeSubscription,
} from "./types";

/**
 * Creates a RealtimeAdapter implementation for Appwrite.
 * 
 * This adapter maps Appwrite's event-based realtime system into a 
 * generic, typed interface used by the application features.
 */
export const createAppwriteRealtimeAdapter = (): RealtimeAdapter => {
  const realtime = getBrowserRealtime();

  return {
    /**
     * Subscribes to an Appwrite channel and maps incoming events to internal types.
     * 
     * @param channel The Appwrite channel to subscribe to (e.g., 'databases.default.collections.invoices.documents')
     * @param callback Function to execute when a mapped event arrives
     * @param options Error handling and lifecycle callbacks
     */
    subscribe: <T>(
      channel: string,
      callback: RealtimeCallback<T>,
      options?: RealtimeSubscribeOptions,
    ): RealtimeSubscription => {
      const subscription = realtime.subscribe(channel, (response) => {
        try {
          const event = response.events[0] || "";
          let type: RealtimeEventType | undefined;

          if (event.endsWith(".create")) {
            type = "create";
          } else if (event.endsWith(".update")) {
            type = "update";
          } else if (event.endsWith(".delete")) {
            type = "delete";
          }

          if (type) {
            callback({
              type,
              data: response.payload as T,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          options?.onError?.(error);
        }
      });

      return {
        unsubscribe: () => {
          void subscription
            .then((nextSubscription) => {
              return nextSubscription.unsubscribe();
            })
            .catch((error) => options?.onError?.(error));
        },
      };
    },
  };
};
