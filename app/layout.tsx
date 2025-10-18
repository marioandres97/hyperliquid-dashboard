import type { Metadata } from "next";
import "./globals.css";
import { AssetProvider } from "@/lib/context/AssetContext";

export const metadata: Metadata = {
  title: "Hyperliquid Institutional Analysis Dashboard",
  description: "Real-time institutional trading analysis for Hyperliquid DEX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AssetProvider defaultAsset="BTC">
          {children}
        </AssetProvider>
      </body>
    </html>
  );
}
