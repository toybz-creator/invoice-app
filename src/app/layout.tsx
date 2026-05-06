import "./globals.css";

import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "Finance Management Dashboard",
    template: "%s | Finance Management Dashboard",
  },
  description:
    "A production-grade finance dashboard for invoice management, VAT summaries, and realtime financial insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
