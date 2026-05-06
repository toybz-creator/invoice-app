"use client";

import { Bell, ChevronDown, Search, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { RealtimeStatusIndicator } from "@/components/layout/realtime-status-indicator";

type DashboardHeaderProps = {
  user: {
    name: string;
    email: string;
  };
};

const mobileNavItems = [
  { href: "/", label: "Dashboard" },
  { href: "/invoices", label: "Invoices" },
];

function getPageTitle(pathname: string) {
  if (pathname.startsWith("/invoices")) {
    return "Invoices";
  }

  return "Dashboard";
}

function getUserInitial(name: string, email: string) {
  const source = name.trim() || email.trim();
  return source.charAt(0).toUpperCase() || "U";
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-[#f5f5f5] bg-white lg:pointer-events-none lg:fixed lg:left-[250px] lg:right-0 lg:top-0 lg:border-b-0">
      <div className="flex h-[84px] items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3 lg:hidden">
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

        <div className="hidden items-center gap-3 lg:flex">
          <h1 className="text-[28px] font-semibold tracking-normal text-[#1b212d]">
            {pageTitle}
          </h1>
        </div>

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
            <span className="flex size-9 items-center justify-center rounded-full bg-[#f0f1f3] text-sm font-semibold text-[#1b212d]">
              {user.name || user.email ? (
                getUserInitial(user.name, user.email)
              ) : (
                <UserRound className="size-5" />
              )}
            </span>
            <span className="hidden max-w-[180px] truncate text-sm font-semibold text-[#1b212d] sm:inline">
              {user.name || user.email}
            </span>
            <ChevronDown className="hidden size-4 text-[#1b212d] sm:block" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 border-t border-[#f5f5f5] px-5 pb-3 pt-4 sm:px-8 lg:hidden">
        <h1 className="text-[25px] font-semibold tracking-normal text-[#1b212d]">
          {pageTitle}
        </h1>
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
  );
}
