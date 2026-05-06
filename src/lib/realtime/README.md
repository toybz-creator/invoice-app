# Realtime Boundary

Typed Appwrite Realtime, SSE, and socket adapters belong here so UI components
do not couple directly to vendor-specific realtime APIs.

Invoice screens subscribe through `useInvoiceRealtime({ userId })`. The hook
applies owner-filtered Appwrite events to `invoice-data.store`, exposes
connection status, cleans up on unmount, and retries subscription setup with
backoff after failures. SSE and sockets should be added behind the same typed
adapter contract only when Appwrite Realtime no longer covers the event shape.
