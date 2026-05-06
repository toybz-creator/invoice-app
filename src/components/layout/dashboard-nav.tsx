"use client";

import {
  CircleHelp,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/app/actions/auth.actions";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/dashboard", label: "Transactions", icon: CreditCard },
  { href: "/dashboard", label: "My Wallets", icon: WalletCards },
  { href: "/dashboard", label: "Settings", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <div className="mt-10 flex flex-1 flex-col justify-between">
      <nav aria-label="Primary navigation" className="space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard" && item.label === "Dashboard"
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

      <nav aria-label="Support navigation" className="space-y-0.5">
        <Link
          href="/dashboard"
          className="flex h-[48px] w-[200px] items-center gap-3 rounded-lg px-[15px] text-sm font-medium text-[#929eae] transition hover:bg-white hover:text-[#1b212d]"
        >
          <CircleHelp className="size-5" />
          Help
        </Link>
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
