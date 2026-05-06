export type RealtimeEventType = "create" | "update" | "delete";

export type RealtimePayload<T = unknown> = {
  type: RealtimeEventType;
  data: T;
  timestamp: string;
};

export type RealtimeSubscription = {
  unsubscribe: () => void;
};

export type RealtimeCallback<T = unknown> = (
  payload: RealtimePayload<T>,
) => void;

export type RealtimeSubscribeOptions = {
  onError?: (error: unknown) => void;
};

export type RealtimeAdapter = {
  subscribe: <T>(
    channel: string,
    callback: RealtimeCallback<T>,
    options?: RealtimeSubscribeOptions,
  ) => RealtimeSubscription;
};
