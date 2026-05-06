"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  createInvoiceAction,
  editInvoiceAction,
} from "@/app/actions/invoice.actions";
import { Button } from "@/components/ui/button";
import { toDateInputValue } from "@/features/invoices/lib/dates";
import {
  calculateInvoiceFinancials,
  formatNaira,
} from "@/features/invoices/lib/finance";
import {
  invoiceFormSchema,
  type InvoiceFormValues,
} from "@/features/invoices/schemas/invoice.schema";
import type { Invoice } from "@/types/invoice";

type InvoiceFormProps = {
  invoice?: Invoice;
  onSaved?: () => void;
  onCancel?: () => void;
};

const defaultValues: InvoiceFormValues = {
  clientName: "",
  clientEmail: "",
  amount: 0,
  vatRate: 7.5,
  dueDate: "",
  status: "unpaid",
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs font-medium text-[#eb5757]">{message}</p>;
}

export function InvoiceForm({ invoice, onSaved, onCancel }: InvoiceFormProps) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: invoice
      ? {
          clientName: invoice.clientName,
          clientEmail: invoice.clientEmail,
          amount: invoice.amount,
          vatRate: invoice.vatRate,
          dueDate: toDateInputValue(invoice.dueDate),
          status: invoice.status,
        }
      : defaultValues,
  });

  useEffect(() => {
    if (!invoice) {
      reset(defaultValues);
      return;
    }

    reset({
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      amount: invoice.amount,
      vatRate: invoice.vatRate,
      dueDate: toDateInputValue(invoice.dueDate),
      status: invoice.status,
    });
  }, [invoice, reset]);

  const [watchedAmount, watchedVatRate] = useWatch({
    control,
    name: ["amount", "vatRate"],
  });
  const amount = Number(watchedAmount || 0);
  const vatRate = Number(watchedVatRate || 0);
  const preview = calculateInvoiceFinancials(
    Number.isFinite(amount) ? amount : 0,
    Number.isFinite(vatRate) ? vatRate : 0,
  );

  const submit = handleSubmit((values) => {
    startTransition(async () => {
      const result = invoice
        ? await editInvoiceAction({ ...values, id: invoice.id })
        : await createInvoiceAction(values);

      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            setError(field as keyof InvoiceFormValues, {
              message: messages[0],
              type: "server",
            });
          }
        }

        toast.error(result.error);
        return;
      }

      toast.success(result.message);

      if (!invoice) {
        reset(defaultValues);
      }

      onSaved?.();
    });
  });

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-[#1b212d]">
            Client name
          </span>
          <input
            className="h-12 w-full rounded-[10px] border border-[#f5f5f5] bg-white px-4 text-sm text-[#1b212d] outline-none transition focus:border-[#c8ee44] focus:ring-3 focus:ring-[#c8ee44]/30"
            disabled={isPending}
            {...register("clientName")}
          />
          <FieldError message={errors.clientName?.message} />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium text-[#1b212d]">
            Client email
          </span>
          <input
            className="h-12 w-full rounded-[10px] border border-[#f5f5f5] bg-white px-4 text-sm text-[#1b212d] outline-none transition focus:border-[#c8ee44] focus:ring-3 focus:ring-[#c8ee44]/30"
            disabled={isPending}
            type="email"
            {...register("clientEmail")}
          />
          <FieldError message={errors.clientEmail?.message} />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium text-[#1b212d]">
            Amount (NGN)
          </span>
          <input
            className="h-12 w-full rounded-[10px] border border-[#f5f5f5] bg-white px-4 text-sm text-[#1b212d] outline-none transition focus:border-[#c8ee44] focus:ring-3 focus:ring-[#c8ee44]/30"
            disabled={isPending}
            inputMode="decimal"
            min="0"
            step="0.01"
            type="number"
            {...register("amount")}
          />
          <FieldError message={errors.amount?.message} />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium text-[#1b212d]">VAT (%)</span>
          <input
            className="h-12 w-full rounded-[10px] border border-[#f5f5f5] bg-white px-4 text-sm text-[#1b212d] outline-none transition focus:border-[#c8ee44] focus:ring-3 focus:ring-[#c8ee44]/30"
            disabled={isPending}
            inputMode="decimal"
            min="0"
            max="100"
            step="0.01"
            type="number"
            {...register("vatRate")}
          />
          <FieldError message={errors.vatRate?.message} />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium text-[#1b212d]">Due date</span>
          <input
            className="h-12 w-full rounded-[10px] border border-[#f5f5f5] bg-white px-4 text-sm text-[#1b212d] outline-none transition focus:border-[#c8ee44] focus:ring-3 focus:ring-[#c8ee44]/30"
            disabled={isPending}
            type="date"
            {...register("dueDate")}
          />
          <FieldError message={errors.dueDate?.message} />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium text-[#1b212d]">Status</span>
          <select
            className="h-12 w-full rounded-[10px] border border-[#f5f5f5] bg-white px-4 text-sm text-[#1b212d] outline-none transition focus:border-[#c8ee44] focus:ring-3 focus:ring-[#c8ee44]/30"
            disabled={isPending}
            {...register("status")}
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>
          <FieldError message={errors.status?.message} />
        </label>
      </div>

      <div className="grid gap-3 rounded-[10px] bg-[#fafafa] p-4 text-sm sm:grid-cols-3">
        <div>
          <p className="text-[#929eae]">Subtotal</p>
          <p className="mt-1 font-semibold">{formatNaira(preview.amount)}</p>
        </div>
        <div>
          <p className="text-[#929eae]">VAT preview</p>
          <p className="mt-1 font-semibold">{formatNaira(preview.vatAmount)}</p>
        </div>
        <div>
          <p className="text-[#929eae]">Total preview</p>
          <p className="mt-1 font-semibold">{formatNaira(preview.total)}</p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onCancel}
            className="h-12 rounded-[10px] border-[#f5f5f5]"
          >
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={isPending}
          className="h-12 rounded-[10px] bg-[#c8ee44] px-6 font-semibold text-[#1b212d] hover:bg-[#b8df35]"
        >
          {isPending ? <Loader2 className="animate-spin" /> : null}
          {invoice ? "Save changes" : "Create invoice"}
        </Button>
      </div>
    </form>
  );
}
