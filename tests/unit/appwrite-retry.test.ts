import { describe, expect, it, vi } from "vitest";

import { withAppwriteRetry } from "@/lib/appwrite/retry";

vi.mock("@/lib/logger", () => ({
  logDevelopmentError: vi.fn(),
}));

describe("Appwrite retry helper", () => {
  it("retries transient fetch failures before returning data", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error("fetch failed"))
      .mockResolvedValueOnce("ok");

    await expect(
      withAppwriteRetry(operation, { label: "Test operation" }),
    ).resolves.toBe("ok");

    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("does not retry non-transient validation failures", async () => {
    const operation = vi
      .fn()
      .mockRejectedValue(new Error("Document contains invalid data"));

    await expect(
      withAppwriteRetry(operation, { label: "Test operation" }),
    ).rejects.toThrow("Document contains invalid data");

    expect(operation).toHaveBeenCalledTimes(1);
  });
});
