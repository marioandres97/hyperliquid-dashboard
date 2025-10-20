import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/query/QueryProvider";
import { ErrorBoundary } from "@/lib/monitoring/errorBoundary";
import { ToastProvider } from "@/lib/hooks/ToastContext";

export const metadata: Metadata = {
  title: "Venomouz Insightz",
  description: "Elite Trading Terminal for Premium Traders - Real-time market intelligence, institutional-grade analytics, and precision trading tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorBoundary>
          <QueryProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
