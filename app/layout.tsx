import type { Metadata, Viewport } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/query/QueryProvider";
import { ErrorBoundary } from "@/lib/monitoring/errorBoundary";
import { ToastProvider } from "@/lib/hooks/ToastContext";
import BottomNav from "@/components/mobile/BottomNav";
import InstallPrompt from "@/components/mobile/InstallPrompt";
import StructuredData from "@/components/StructuredData";
import SWRProvider from "@/components/SWRProvider";
import { WhaleTrackerMonitor } from "@/components/whale-tracking/WhaleTrackerMonitor";

export const metadata: Metadata = {
  metadataBase: new URL('https://venomouz-insightz.com'),
  title: {
    default: "Venomouz Insightz - Elite Trading Terminal",
    template: "%s | Venomouz Insightz"
  },
  description: "Elite Trading Terminal for Premium Traders - Real-time market intelligence, institutional-grade analytics, and precision trading tools for crypto markets",
  keywords: [
    "trading terminal",
    "crypto trading",
    "market intelligence",
    "institutional analytics",
    "real-time prices",
    "economic calendar",
    "trading alerts",
    "PnL tracker",
    "large orders",
    "hyperliquid"
  ],
  authors: [{ name: "Venomouz Insightz" }],
  creator: "Venomouz Insightz",
  publisher: "Venomouz Insightz",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://venomouz-insightz.com",
    siteName: "Venomouz Insightz",
    title: "Venomouz Insightz - Elite Trading Terminal",
    description: "Elite Trading Terminal for Premium Traders - Real-time market intelligence, institutional-grade analytics, and precision trading tools",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Venomouz Insightz Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Venomouz Insightz - Elite Trading Terminal",
    description: "Elite Trading Terminal for Premium Traders",
    images: ["/icon-512x512.png"],
    creator: "@venomouz",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Venomouz Insightz',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#10B981',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <StructuredData />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Venomouz" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased mobile-safe-area">
        <ErrorBoundary>
          <SWRProvider>
            <QueryProvider>
              <ToastProvider>
                <WhaleTrackerMonitor />
                {children}
                <BottomNav />
                <InstallPrompt />
              </ToastProvider>
            </QueryProvider>
          </SWRProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
