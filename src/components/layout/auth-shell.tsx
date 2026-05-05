import Image from "next/image";
import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-white text-[#1b212d] lg:grid lg:grid-cols-[53.125%_46.875%]">
      <section className="flex min-h-dvh flex-col px-6 py-10 sm:px-12 lg:px-[9.375vw]">
        <div className="flex items-center gap-3">
          <Image src="/maglo-mark.svg" alt="" width={30} height={30} priority />
          <p className="text-lg leading-none font-bold">Maglo.</p>
        </div>
        <div className="flex flex-1 items-center py-12">{children}</div>
      </section>

      <section
        aria-hidden="true"
        className="relative hidden min-h-dvh overflow-hidden bg-[#e5e7ea] lg:block"
      >
        <Image
          src="/auth-hero.png"
          alt=""
          fill
          priority
          sizes="47vw"
          className="object-cover object-[52%_center]"
        />
        <div className="absolute inset-0 bg-[#1b212d]/10" />
      </section>
    </main>
  );
}
