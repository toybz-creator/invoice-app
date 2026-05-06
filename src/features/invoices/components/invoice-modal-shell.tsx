"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type InvoiceModalShellProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function InvoiceModalShell({
  title,
  children,
  onClose,
}: InvoiceModalShellProps) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#1b212d]/45 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-modal-title"
    >
      <div className="mx-auto min-h-full w-full max-w-[1120px] content-center">
        <div className="rounded-[18px] bg-white p-5 shadow-2xl sm:p-7">
          <div className="mb-7 flex items-center justify-between gap-4">
            <h2
              id="invoice-modal-title"
              className="text-[25px] font-semibold text-[#1b212d]"
            >
              {title}
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full text-[#929eae] hover:bg-[#fafafa] hover:text-[#1b212d]"
            >
              <X />
              <span className="sr-only">Close modal</span>
            </Button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
