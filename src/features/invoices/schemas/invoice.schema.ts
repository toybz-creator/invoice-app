import { z } from "zod";

import { invoiceStatuses } from "@/types/invoice";

const isoDateInput = z
  .string()
  .trim()
  .min(1, "Due date is required.")
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Enter a valid due date.",
  });

export const invoiceIdSchema = z
  .string()
  .trim()
  .min(1, "Invoice ID is required.");

export const invoiceStatusSchema = z.enum(invoiceStatuses);

export const invoiceFormSchema = z.object({
  clientName: z
    .string()
    .trim()
    .min(2, "Client name must be at least 2 characters.")
    .max(120, "Client name must be 120 characters or fewer."),
  clientEmail: z
    .string()
    .trim()
    .email("Enter a valid client email.")
    .max(254, "Client email must be 254 characters or fewer."),
  amount: z.coerce
    .number<number>()
    .finite("Amount must be a valid number.")
    .positive("Amount must be greater than zero.")
    .max(1_000_000_000, "Amount is too large."),
  vatRate: z.coerce
    .number<number>()
    .finite("VAT rate must be a valid number.")
    .min(0, "VAT rate cannot be negative.")
    .max(100, "VAT rate cannot exceed 100%."),
  dueDate: isoDateInput,
  status: invoiceStatusSchema,
});

export const createInvoiceSchema = invoiceFormSchema;

export const editInvoiceSchema = invoiceFormSchema.extend({
  id: invoiceIdSchema,
});

export const deleteInvoiceSchema = z.object({
  id: invoiceIdSchema,
});

export const updateInvoiceStatusSchema = z.object({
  id: invoiceIdSchema,
  status: invoiceStatusSchema,
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type EditInvoiceInput = z.infer<typeof editInvoiceSchema>;
export type DeleteInvoiceInput = z.infer<typeof deleteInvoiceSchema>;
export type UpdateInvoiceStatusInput = z.infer<
  typeof updateInvoiceStatusSchema
>;
