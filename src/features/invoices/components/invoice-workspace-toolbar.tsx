"use client";

import {
  CheckCircle2,
  Filter,
  ReceiptText,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { InvoiceFilter } from "@/stores/invoice-ui.store";

type InvoiceWorkspaceToolbarProps = {
  search: string;
  filter: InvoiceFilter;
  pageSize: number;
  filters: Array<{ label: string; value: InvoiceFilter }>;
  pageSizeOptions: number[];
  onSearchChange: (value: string) => void;
  onFilterChange: (value: InvoiceFilter) => void;
  onPageSizeChange: (value: number) => void;
  onCreate: () => void;
};

export function InvoiceWorkspaceToolbar({
  search,
  filter,
  pageSize,
  filters,
  pageSizeOptions,
  onSearchChange,
  onFilterChange,
  onPageSizeChange,
  onCreate,
}: InvoiceWorkspaceToolbarProps) {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <section className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
      <div>
        <label className="relative block w-full md:w-[225px]">
          <span className="sr-only">Search invoices</span>
          <Search className="absolute left-[18px] top-1/2 size-5 -translate-y-1/2 text-[#1b212d]" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search invoices"
            className="h-[48px] w-full rounded-[15px] border border-[#f5f5f5] bg-[#f8f8f8] pl-[54px] pr-4 text-sm text-[#1b212d] outline-none transition placeholder:text-[#929eae] focus:border-[#c8ee44] focus:ring-3 focus:ring-[#c8ee44]/30"
          />
        </label>
      </div>

      <div className="relative flex flex-col gap-3 md:flex-row md:items-center xl:pt-[56px]">
        <Button
          onClick={onCreate}
          className="h-[48px] rounded-[10px] bg-[#c8ee44] px-5 text-sm font-semibold text-[#1b212d] hover:bg-[#b8df35]"
        >
          <ReceiptText />
          Create Invoice
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setFilterOpen((open) => !open)}
          className="h-[48px] rounded-[10px] border-[#f5f5f5] bg-white px-5 text-sm font-medium text-[#1b212d] hover:bg-[#fafafa]"
        >
          <Filter className="size-4" />
          Filters
        </Button>

        {filterOpen ? (
          <div className="absolute right-0 top-full z-20 mt-3 w-[260px] rounded-[15px] border border-[#f5f5f5] bg-white p-4 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1b212d]">
              <SlidersHorizontal className="size-4" />
              Filter invoices
            </div>
            <div className="mt-4 space-y-2">
              {filters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onFilterChange(item.value)}
                  className={cn(
                    "flex h-10 w-full items-center justify-between rounded-[10px] px-3 text-sm font-medium transition",
                    filter === item.value
                      ? "bg-[#c8ee44] text-[#1b212d]"
                      : "bg-[#fafafa] text-[#929eae] hover:text-[#1b212d]",
                  )}
                >
                  {item.label}
                  {filter === item.value ? (
                    <CheckCircle2 className="size-4" />
                  ) : null}
                </button>
              ))}
            </div>
            <label className="mt-4 block text-sm font-medium text-[#1b212d]">
              Rows per page
              <select
                value={pageSize}
                onChange={(event) =>
                  onPageSizeChange(Number(event.target.value))
                }
                className="mt-2 h-10 w-full rounded-[10px] border border-[#f5f5f5] bg-white px-3 text-sm outline-none focus:border-[#c8ee44]"
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
      </div>
    </section>
  );
}
