"use server";

import { calculateInvoiceFinancials } from "@/features/invoices/lib/finance";
import {
  createInvoiceSchema,
  deleteInvoiceSchema,
  editInvoiceSchema,
  updateInvoiceStatusSchema,
} from "@/features/invoices/schemas/invoice.schema";
import {
  createInvoiceRow,
  deleteInvoiceRowForUser,
  updateInvoiceRowForUser,
} from "@/lib/appwrite/database";
import { getAuthenticatedUser } from "@/lib/appwrite/session";
import { fieldErrorsFromIssues } from "@/lib/validation/field-errors";
import type { Invoice } from "@/types/invoice";

export type InvoiceActionResult<T = Invoice> =
  | { ok: true; data: T; message: string }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };

function normalizeDueDate(value: string) {
  return new Date(value).toISOString();
}

function invoiceActionError(error: string) {
  return { ok: false, error } satisfies InvoiceActionResult;
}

async function requireAuthenticatedUser() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return null;
  }

  return user;
}

/**
 * Trusted mutation boundary for creating a new invoice.
 *
 * Security:
 * - Verifies the authenticated user via Appwrite session.
 * - Validates input using Zod schema.
 * - Recalculates all financial derived fields (VAT, Total) server-side to prevent tampering.
 * - Assigns the owner-only userId from the trusted session.
 */
export async function createInvoiceAction(
  input: unknown,
): Promise<InvoiceActionResult> {
  const user = await requireAuthenticatedUser();

  if (!user) {
    return invoiceActionError("You must be signed in to create invoices.");
  }

  const parsed = createInvoiceSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFromIssues(parsed.error.issues),
    };
  }

  const financials = calculateInvoiceFinancials(
    parsed.data.amount,
    parsed.data.vatRate,
  );

  const result = await createInvoiceRow({
    userId: user.$id,
    clientName: parsed.data.clientName,
    clientEmail: parsed.data.clientEmail,
    dueDate: normalizeDueDate(parsed.data.dueDate),
    status: parsed.data.status,
    paidAt: parsed.data.status === "paid" ? new Date().toISOString() : null,
    ...financials,
  });

  if (!result.ok) {
    return invoiceActionError(
      "The invoice could not be created. Please try again.",
    );
  }

  return {
    ok: true,
    data: result.data,
    message: "Invoice created successfully.",
  };
}

/**
 * Trusted mutation boundary for editing an existing invoice.
 *
 * Security:
 * - Verifies the authenticated user via Appwrite session.
 * - Validates input using Zod schema.
 * - Enforces row ownership by passing the trusted userId to the Appwrite database helper.
 * - Recalculates all financial derived fields (VAT, Total) server-side.
 */
export async function editInvoiceAction(
  input: unknown,
): Promise<InvoiceActionResult> {
  const user = await requireAuthenticatedUser();

  if (!user) {
    return invoiceActionError("You must be signed in to edit invoices.");
  }

  const parsed = editInvoiceSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFromIssues(parsed.error.issues),
    };
  }

  const now = new Date().toISOString();
  const financials = calculateInvoiceFinancials(
    parsed.data.amount,
    parsed.data.vatRate,
  );

  const result = await updateInvoiceRowForUser(parsed.data.id, user.$id, {
    clientName: parsed.data.clientName,
    clientEmail: parsed.data.clientEmail,
    dueDate: normalizeDueDate(parsed.data.dueDate),
    status: parsed.data.status,
    paidAt: parsed.data.status === "paid" ? now : null,
    ...financials,
  });

  if (!result.ok) {
    return invoiceActionError(
      result.status === 404
        ? "Invoice not found."
        : "The invoice could not be updated. Please try again.",
    );
  }

  return {
    ok: true,
    data: result.data,
    message: "Invoice updated successfully.",
  };
}

export async function deleteInvoiceAction(
  input: unknown,
): Promise<InvoiceActionResult<{ id: string }>> {
  const user = await requireAuthenticatedUser();

  if (!user) {
    return invoiceActionError("You must be signed in to delete invoices.");
  }

  const parsed = deleteInvoiceSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFromIssues(parsed.error.issues),
    };
  }

  const result = await deleteInvoiceRowForUser(parsed.data.id, user.$id);

  if (!result.ok) {
    return invoiceActionError(
      result.status === 404
        ? "Invoice not found."
        : "The invoice could not be deleted. Please try again.",
    );
  }

  return {
    ok: true,
    data: result.data,
    message: "Invoice deleted successfully.",
  };
}

export async function updateInvoiceStatusAction(
  input: unknown,
): Promise<InvoiceActionResult> {
  const user = await requireAuthenticatedUser();

  if (!user) {
    return invoiceActionError("You must be signed in to update invoices.");
  }

  const parsed = updateInvoiceStatusSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFromIssues(parsed.error.issues),
    };
  }

  const result = await updateInvoiceRowForUser(parsed.data.id, user.$id, {
    status: parsed.data.status,
    paidAt: parsed.data.status === "paid" ? new Date().toISOString() : null,
  });

  if (!result.ok) {
    return invoiceActionError(
      result.status === 404
        ? "Invoice not found."
        : "The invoice status could not be updated. Please try again.",
    );
  }

  return {
    ok: true,
    data: result.data,
    message:
      parsed.data.status === "paid"
        ? "Invoice marked as paid."
        : "Invoice marked as unpaid.",
  };
}
