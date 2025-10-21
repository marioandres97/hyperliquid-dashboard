'use client';

import Header from '@/components/Header';
import { LazyLargeOrdersFeed } from '@/lib/lazy-components';

export default function OrdersPage() {

  return (
    <div className="min-h-screen" style={{ background: '#FAFAFA' }}>
      <Header />
      <LazyLargeOrdersFeed />
    </div>
  );
}
