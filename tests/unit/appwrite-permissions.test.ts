import { describe, expect, it } from "vitest";

import { invoiceRowPermissions } from "@/lib/appwrite/permissions";

describe("Appwrite permissions", () => {
  it("limits invoice rows to their owner", () => {
    expect(invoiceRowPermissions("user-123")).toEqual([
      'read("user:user-123")',
      'update("user:user-123")',
      'delete("user:user-123")',
    ]);
  });
});
