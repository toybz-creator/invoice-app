import { AppwriteException } from "node-appwrite";

import type { AppResult } from "@/types/result";

const fallbackMessage = "The Appwrite request failed. Please try again.";

export function toAppwriteError(error: unknown): AppResult<never> {
  if (error instanceof AppwriteException) {
    return {
      ok: false,
      error: error.message || fallbackMessage,
      status: error.code,
    };
  }

  if (error instanceof Error) {
    return { ok: false, error: error.message };
  }

  return { ok: false, error: fallbackMessage };
}
