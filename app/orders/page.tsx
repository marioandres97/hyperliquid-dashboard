import Header from '@/components/Header';
import MarketHoursBar from '@/components/MarketHoursBar';
import FeatureNavigation from '@/components/navigation/FeatureNavigation';
import { LargeOrdersFeed } from '@/components/large-orders/LargeOrdersFeed';

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#064E3B] via-[#0D1B17] to-[#0A0E14]">
      <Header />
      <MarketHoursBar />
      
      <div className="container mx-auto px-6 md:px-8 py-12 md:py-16">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 
            className="text-5xl md:text-6xl font-semibold mb-4"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.03em'
            }}
          >
            Large Orders Feed
          </h1>
          <p className="text-gray-400 text-lg" style={{ letterSpacing: '0.02em' }}>
            Monitor institutional order flow and whale movements in real-time
          </p>
        </div>

        {/* Navigation Tabs */}
        <FeatureNavigation />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Total Volume</p>
            <p className="text-3xl font-semibold text-white">$45.2M</p>
          </div>
          <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Avg Order Size</p>
            <p className="text-3xl font-semibold text-white">$125K</p>
          </div>
          <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Buy/Sell Ratio</p>
            <p className="text-3xl font-semibold text-emerald-500">1.8</p>
          </div>
          <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Whales Active</p>
            <p className="text-3xl font-semibold text-white">23</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-3xl p-8">
          <LargeOrdersFeed />
        </div>
      </div>
    </div>
  );
}
