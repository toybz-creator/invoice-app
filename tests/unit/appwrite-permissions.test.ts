import { describe, expect, it } from "vitest";

import { invoiceDocumentPermissions } from "@/lib/appwrite/permissions";

describe("Appwrite permissions", () => {
  it("limits invoice documents to their owner", () => {
    expect(invoiceDocumentPermissions("user-123")).toEqual([
      'read("user:user-123")',
      'update("user:user-123")',
      'delete("user:user-123")',
    ]);
  });
});
