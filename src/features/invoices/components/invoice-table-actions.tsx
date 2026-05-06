"use client";

import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

import { InvoiceActionMenu } from "@/features/invoices/components/invoice-action-menu";
import type { Invoice } from "@/types/invoice";

type InvoiceTableActionsProps =
  | {
      mode: "interactive";
      invoice: Invoice;
      isMenuOpen: boolean;
      isPending: boolean;
      onToggleMenu: () => void;
      onView: () => void;
      onEdit: () => void;
      onStatus: () => void;
      onDelete: () => void;
    }
  | {
      mode: "link";
      invoice: Invoice;
      href?: string;
    };

export function InvoiceTableActions(props: InvoiceTableActionsProps) {
  if (props.mode === "link") {
    return (
      <Link
        href={props.href ?? "/invoices"}
        className="inline-flex size-9 items-center justify-center rounded-full text-[#00aa78] transition hover:bg-[#fafafa] hover:text-[#1b212d]"
      >
        <MoreHorizontal className="size-5" />
        <span className="sr-only">
          Open invoice workspace for {props.invoice.clientName}
        </span>
      </Link>
    );
  }

  return (
    <div className="relative flex justify-center">
      <button
        type="button"
        className="flex size-8 items-center justify-center rounded-full text-[#00aa78] transition hover:bg-[#d9ffe9]"
        onClick={props.onToggleMenu}
      >
        <MoreHorizontal className="size-5" />
        <span className="sr-only">
          Open invoice actions for {props.invoice.clientName}
        </span>
      </button>

      {props.isMenuOpen ? (
        <InvoiceActionMenu
          invoice={props.invoice}
          isPending={props.isPending}
          onView={props.onView}
          onEdit={props.onEdit}
          onStatus={props.onStatus}
          onDelete={props.onDelete}
        />
      ) : null}
    </div>
  );
}
