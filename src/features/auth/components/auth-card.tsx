import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AuthCardProps = {
  title: string;
  subtitle: string;
  footerText: string;
  footerHref: string;
  footerLinkText: string;
  underlineClassName?: string;
  children: ReactNode;
};

export function AuthCard({
  title,
  subtitle,
  footerText,
  footerHref,
  footerLinkText,
  underlineClassName,
  children,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-[404px] space-y-6">
      <div className="space-y-2">
        <h1 className="text-[30px] leading-none font-semibold text-[#1b212d]">
          {title}
        </h1>
        <p className="text-base leading-none text-[#78778b]">{subtitle}</p>
      </div>

      {children}

      <p className="text-center text-sm leading-none text-[#929eae]">
        {footerText}{" "}
        <Link
          href={footerHref}
          className="relative inline-flex font-medium text-[#1b212d] outline-none hover:underline focus-visible:ring-3 focus-visible:ring-[#c8ee44]/50"
        >
          {footerLinkText}
          <Image
            src="/auth-underline.svg"
            alt=""
            width={96}
            height={11}
            className={cn(
              "pointer-events-none absolute top-full left-1/2 mt-1 -translate-x-1/2",
              underlineClassName,
            )}
          />
        </Link>
      </p>
    </div>
  );
}
