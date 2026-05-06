"use client";

import {
  BookMarked,
  Home,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/app/actions/auth.actions";

const primaryNavItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/invoices", label: "Invoices", icon: BookMarked },
];

const secondaryNavItems: Array<{ href: string; label: string; icon: any }> = [];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <div className="mt-10 flex flex-1 flex-col justify-between">
      <nav aria-label="Primary navigation" className="space-y-0.5">
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "flex h-[48px] w-[200px] items-center gap-3 rounded-lg bg-[#c8ee44] px-[15px] text-sm font-semibold text-[#1b212d]"
                  : "flex h-[48px] w-[200px] items-center gap-3 rounded-lg px-[15px] text-sm font-medium text-[#929eae] transition hover:bg-white hover:text-[#1b212d]"
              }
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <nav aria-label="Account navigation" className="space-y-0.5">
        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              className="flex h-[48px] w-[200px] items-center gap-3 rounded-lg px-[15px] text-sm font-medium text-[#929eae] transition hover:bg-white hover:text-[#1b212d]"
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex h-[48px] w-[200px] items-center gap-3 rounded-lg px-[15px] text-sm font-medium text-[#929eae] transition hover:bg-white hover:text-[#1b212d]"
          >
            <LogOut className="size-5" />
            Logout
          </button>
        </form>
      </nav>
    </div>
  );
}
