import { getAppEnvironment } from "@/lib/appwrite/config";

type LogContext = Record<string, unknown>;

function shouldLogDebugErrors() {
  return getAppEnvironment() === "development";
}

export function logDevelopmentError(
  message: string,
  error: unknown,
  context: LogContext = {},
) {
  if (!shouldLogDebugErrors()) {
    return;
  }

  console.error(`[invoice-app] ${message}`, {
    context,
    error,
  });
}
