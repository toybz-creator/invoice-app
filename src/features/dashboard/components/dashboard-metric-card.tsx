import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DashboardMetricCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
  featured?: boolean;
};

function metricToneClasses(featured?: boolean) {
  return featured ? "bg-[#343941] text-white" : "bg-[#fafafa] text-[#1b212d]";
}

export function DashboardMetricCard({
  label,
  value,
  icon,
  featured,
}: DashboardMetricCardProps) {
  return (
    <section
      className={cn(
        "flex min-h-[106px] items-center gap-6 rounded-lg p-5",
        metricToneClasses(featured),
      )}
    >
      <span
        className={cn(
          "flex size-[42px] shrink-0 items-center justify-center rounded-full",
          featured
            ? "bg-white/10 text-[#c8ee44]"
            : "bg-[#f0f1f3] text-[#343941]",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm",
            featured ? "text-white/60" : "text-[#929eae]",
          )}
        >
          {label}
        </p>
        <p className="mt-2 truncate font-mono text-2xl font-bold tracking-normal">
          {value}
        </p>
      </div>
    </section>
  );
}
