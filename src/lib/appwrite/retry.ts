import { logDevelopmentError } from "@/lib/logger";

type RetryOptions = {
  attempts?: number;
  context?: Record<string, unknown>;
  label: string;
};

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function isRetryableAppwriteError(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "number" &&
    (error.code === 429 || error.code >= 500)
  ) {
    return true;
  }

  if (!(error instanceof Error)) {
    return true;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("fetch failed") ||
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("socket") ||
    message.includes("econnreset") ||
    message.includes("temporarily unavailable")
  );
}

export async function withAppwriteRetry<T>(
  operation: () => Promise<T>,
  { attempts = 2, context = {}, label }: RetryOptions,
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      logDevelopmentError(`${label} failed`, error, { ...context, attempt });

      if (attempt >= attempts || !isRetryableAppwriteError(error)) {
        break;
      }

      await wait(150 * attempt);
    }
  }

  throw lastError;
}
