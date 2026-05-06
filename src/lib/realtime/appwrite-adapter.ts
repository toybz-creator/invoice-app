import { getBrowserRealtime } from "@/lib/appwrite/client";

import type {
  RealtimeAdapter,
  RealtimeCallback,
  RealtimeEventType,
  RealtimeSubscribeOptions,
  RealtimeSubscription,
} from "./types";

export const createAppwriteRealtimeAdapter = (): RealtimeAdapter => {
  const realtime = getBrowserRealtime();

  return {
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
