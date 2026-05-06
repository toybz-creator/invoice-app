import { Bell, Search, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { DashboardNav } from "@/components/layout/dashboard-nav";

const mobileNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/invoices", label: "Invoices" },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-white text-[#1b212d]">
      <aside className="fixed inset-y-0 left-0 hidden w-[250px] flex-col bg-[#fafafa] px-[25px] py-[30px] lg:flex">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/figma/maglo-exclude.svg"
            alt=""
            width={30}
            height={30}
            className="size-[30px]"
            priority
          />
          <span className="text-lg font-bold">Maglo.</span>
        </Link>

        <DashboardNav />
      </aside>

      <header className="sticky top-0 z-30 border-b border-[#f5f5f5] bg-white/95 backdrop-blur lg:pointer-events-none lg:fixed lg:left-[250px] lg:right-0 lg:top-0 lg:border-b-0 lg:bg-transparent lg:backdrop-blur-0">
        <div className="flex h-[84px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/dashboard" className="flex items-center gap-3 lg:hidden">
            <Image
              src="/figma/maglo-exclude.svg"
              alt=""
              width={30}
              height={30}
              className="size-[30px]"
              priority
            />
            <span className="text-lg font-bold">Maglo.</span>
          </Link>

          <div className="hidden lg:block" />

          <div className="pointer-events-auto flex items-center gap-5 sm:gap-8">
            <button
              type="button"
              className="hidden size-9 items-center justify-center rounded-full text-[#929eae] transition hover:bg-[#fafafa] hover:text-[#1b212d] sm:flex"
            >
              <Search className="size-5" />
              <span className="sr-only">Search</span>
            </button>
            <button
              type="button"
              className="hidden size-9 items-center justify-center rounded-full text-[#929eae] transition hover:bg-[#fafafa] hover:text-[#1b212d] sm:flex"
            >
              <Bell className="size-5" />
              <span className="sr-only">Notifications</span>
            </button>
            <div className="flex h-12 items-center gap-3 rounded-full bg-[#fafafa] py-1.5 pl-2 pr-4">
              <span className="flex size-9 items-center justify-center rounded-full bg-[#c8ee44] text-sm font-semibold">
                <UserRound className="size-5" />
              </span>
              <span className="hidden text-sm font-semibold text-[#1b212d] sm:inline">
                Mahfuzul Nabil
              </span>
            </div>
          </div>
        </div>
        <nav
          aria-label="Mobile navigation"
          className="flex gap-2 overflow-x-auto border-t border-[#f5f5f5] px-5 py-3 sm:px-8 lg:hidden"
        >
          {mobileNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg bg-[#fafafa] px-4 py-2 text-sm font-medium text-[#1b212d] transition hover:bg-[#c8ee44]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="w-full px-5 py-6 sm:px-8 lg:ml-[250px] lg:w-[calc(100%-250px)] lg:px-10 lg:pt-[42px]">
        {children}
      </main>
    </div>
  );
}
