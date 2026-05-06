import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { RealtimeStatusIndicator } from "@/components/layout/realtime-status-indicator";

type DashboardShellProps = {
  user: {
    name: string;
    email: string;
  };
  children: ReactNode;
};

export function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <div className="min-h-dvh bg-white text-[#1b212d]">
      <aside className="fixed inset-y-0 left-0 hidden w-[250px] flex-col bg-[#fafafa] px-[25px] py-[30px] lg:flex">
        <Link href="/" className="flex items-center gap-3">
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

      <DashboardHeader user={user} />

      <main className="w-full px-5 py-6 sm:px-8 lg:ml-[250px] lg:w-[calc(100%-250px)] lg:px-10 lg:pt-[98px]">
        {children}
      </main>

      <div className="fixed bottom-6 right-6 z-50">
        <RealtimeStatusIndicator announce={false} />
      </div>
    </div>
  );
}
