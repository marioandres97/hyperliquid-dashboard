'use client';

import dynamic from 'next/dynamic';
import CalendarSkeleton from '@/components/skeletons/CalendarSkeleton';
import OrdersFeedSkeleton from '@/components/skeletons/OrdersFeedSkeleton';
import AlertsSkeleton from '@/components/skeletons/AlertsSkeleton';
import PnLSkeleton from '@/components/skeletons/PnLSkeleton';
import PricesSkeleton from '@/components/skeletons/PricesSkeleton';

// Lazy load heavy components with custom loading skeletons
export const LazyEconomicCalendar = dynamic(
  () => import('@/components/economic-calendar/EconomicCalendar').then(mod => ({ default: mod.EconomicCalendar })),
  {
    loading: () => <CalendarSkeleton />,
    ssr: false,
  }
);

export const LazyLargeOrdersFeed = dynamic(
  () => import('@/components/large-orders/MinimalLargeOrdersFeed').then(mod => ({ default: mod.MinimalLargeOrdersFeed })),
  {
    loading: () => <OrdersFeedSkeleton />,
    ssr: false,
  }
);

export const LazyAlertSystem = dynamic(
  () => import('@/components/alerts/AlertSystem').then(mod => ({ default: mod.AlertSystem })),
  {
    loading: () => <AlertsSkeleton />,
    ssr: false,
  }
);

export const LazyPnLTracker = dynamic(
  () => import('@/widgets/pnl-tracker/PnLTrackerWidget').then(mod => ({ default: mod.PnLTrackerWidgetWithBackground })),
  {
    loading: () => <PnLSkeleton />,
    ssr: false,
  }
);

export const LazyRealTimePrices = dynamic(
  () => import('@/widgets/real-time-prices/RealTimePricesWidget'),
  {
    loading: () => <PricesSkeleton />,
    ssr: false,
  }
);
