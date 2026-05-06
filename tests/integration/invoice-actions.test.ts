import { describe, expect, it, vi } from "vitest";

import {
  createInvoiceAction,
  deleteInvoiceAction,
  editInvoiceAction,
  updateInvoiceStatusAction,
} from "@/app/actions/invoice.actions";

const mocks = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  createInvoiceDocument: vi.fn(),
  updateInvoiceDocumentForUser: vi.fn(),
  deleteInvoiceDocumentForUser: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/appwrite/session", () => ({
  getAuthenticatedUser: mocks.getAuthenticatedUser,
}));

vi.mock("@/lib/appwrite/database", () => ({
  createInvoiceDocument: mocks.createInvoiceDocument,
  updateInvoiceDocumentForUser: mocks.updateInvoiceDocumentForUser,
  deleteInvoiceDocumentForUser: mocks.deleteInvoiceDocumentForUser,
}));

describe("invoice actions", () => {
  it("returns an auth error before mutating when the user is anonymous", async () => {
    mocks.getAuthenticatedUser.mockResolvedValueOnce(null);

    await expect(
      createInvoiceAction({
        clientName: "Acme",
        clientEmail: "billing@acme.test",
        amount: 1000,
        vatRate: 7.5,
        dueDate: "2026-05-30",
        status: "unpaid",
      }),
    ).resolves.toMatchObject({
      ok: false,
      error: expect.stringContaining("signed in"),
    });

    expect(mocks.createInvoiceDocument).not.toHaveBeenCalled();
  });

  it("returns validation errors for invalid mutation inputs", async () => {
    mocks.getAuthenticatedUser.mockResolvedValue({
      $id: "user-1",
      name: "Test User",
    });

    await expect(editInvoiceAction({ id: "" })).resolves.toMatchObject({
      ok: false,
      fieldErrors: expect.objectContaining({
        id: expect.any(Array),
      }),
    });

    await expect(deleteInvoiceAction({ id: "" })).resolves.toMatchObject({
      ok: false,
      fieldErrors: expect.objectContaining({
        id: expect.any(Array),
      }),
    });

    await expect(
      updateInvoiceStatusAction({ id: "", status: "pending" }),
    ).resolves.toMatchObject({
      ok: false,
      fieldErrors: expect.objectContaining({
        id: expect.any(Array),
        status: expect.any(Array),
      }),
    });

    expect(mocks.updateInvoiceDocumentForUser).not.toHaveBeenCalled();
    expect(mocks.deleteInvoiceDocumentForUser).not.toHaveBeenCalled();
  });
});
