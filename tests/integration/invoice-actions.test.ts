import { describe, expect, it, vi } from "vitest";

import {
  createInvoiceAction,
  deleteInvoiceAction,
  editInvoiceAction,
  updateInvoiceStatusAction,
} from "@/app/actions/invoice.actions";

const mocks = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  createInvoiceRow: vi.fn(),
  updateInvoiceRowForUser: vi.fn(),
  deleteInvoiceRowForUser: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/appwrite/session", () => ({
  getAuthenticatedUser: mocks.getAuthenticatedUser,
}));

vi.mock("@/lib/appwrite/database", () => ({
  createInvoiceRow: mocks.createInvoiceRow,
  updateInvoiceRowForUser: mocks.updateInvoiceRowForUser,
  deleteInvoiceRowForUser: mocks.deleteInvoiceRowForUser,
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

    expect(mocks.createInvoiceRow).not.toHaveBeenCalled();
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

    expect(mocks.updateInvoiceRowForUser).not.toHaveBeenCalled();
    expect(mocks.deleteInvoiceRowForUser).not.toHaveBeenCalled();
  });
});
