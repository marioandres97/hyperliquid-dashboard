# Hyperliquid Institutional Analysis Dashboard

A professional-grade, real-time institutional trading analysis platform for Hyperliquid DEX. Built with Next.js, TypeScript, and the Hyperliquid SDK.

## 🚀 Features

### ✅ Implemented

#### Real-Time Data Integration
- **WebSocket Streaming**: Live order book, trades, and market data from Hyperliquid DEX
- **REST API Client**: Historical data, funding rates, and asset context
- **Auto-Reconnection**: Robust error handling and automatic reconnection logic

#### Multi-Asset Support  
- **Asset Toggle**: Switch between BTC, ETH, and HYPE in real-time
- **Smart Formatting**: Asset-specific price and volume formatting
- **Context Aware**: All modules respond to asset changes

#### Redis Data Persistence
- **Trades Storage**: 90-day retention with time-based queries
- **Positions Storage**: 180-day retention with PnL tracking
- **Alerts Storage**: 365-day retention with filtering
- **Order Book Snapshots**: 30-day retention, 5-minute intervals

#### Professional Modules
- **Module 1: Liquidity & Order Book** ✅ (Real-time data integrated)
  - Live bid/ask order book from Hyperliquid
  - Volume imbalance indicators
  - Large order detection
  - Spread analysis
  
- **Modules 2-6**: Market analysis modules (mock data, ready for real integration)
  - Module 2: Large Orders Feed
  - Module 3: Top Traders
  - Module 4: Market Intention
  - Module 5: Volatility Context
  - Module 6: Alerts System

### 🔧 Technical Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion
- **Data Visualization**: Recharts
- **Real-Time**: Hyperliquid WebSocket SDK
- **Database**: Redis (optional, graceful degradation)
- **API**: Hyperliquid REST API via @nktkas/hyperliquid

## 📦 Installation

### Prerequisites

- Node.js 20+ 
- npm or yarn
- Redis (optional, for data persistence)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/marioandres97/hyperliquid-dashboard.git
   cd hyperliquid-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and configure:
   ```bash
   # Hyperliquid Configuration
   HYPERLIQUID_TESTNET=false  # Set to true for testnet

   # Redis Configuration (optional)
   REDIS_URL=redis://localhost:6379
   # REDIS_PASSWORD=your_password_if_needed

   # Data Retention (in days)
   REDIS_TRADES_RETENTION=90
   REDIS_POSITIONS_RETENTION=180
   REDIS_ALERTS_RETENTION=365
   REDIS_ORDERBOOK_RETENTION=30

   # WebSocket Configuration
   WS_RECONNECT_DELAY=5000
   WS_MAX_RECONNECT_ATTEMPTS=10

   # Snapshot Recording
   ORDERBOOK_SNAPSHOT_INTERVAL=5  # minutes

   # Default Asset
   NEXT_PUBLIC_DEFAULT_ASSET=BTC
   ```

4. **Start Redis** (optional, skip if not using data persistence)
   ```bash
   # Using Docker
   docker run -d -p 6379:6379 redis:alpine

   # Or using local Redis installation
   redis-server
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
hyperliquid-dashboard/
├── app/
│   ├── api/                      # API routes
│   ├── institutional-analysis/   # Main analysis page
│   ├── layout.tsx                # Root layout with providers
│   └── page.tsx                  # Home page
├── components/
│   ├── institutional-analysis/   # 6 analysis modules
│   │   ├── Module1LiquidityOrderBook/  ✅ Real data
│   │   ├── Module2LargeOrdersFeed/
│   │   ├── Module3TopTraders/
│   │   ├── Module4MarketIntention/
│   │   ├── Module5VolatilityContext/
│   │   └── Module6AlertsSystem/
│   ├── layout/                   # Layout components
│   └── shared/                   # Shared UI components
│       └── AssetToggle.tsx       # BTC/ETH/HYPE selector
├── lib/
│   ├── context/
│   │   └── AssetContext.tsx      # Asset state management
│   ├── hyperliquid/
│   │   ├── client.ts             # REST API client
│   │   ├── websocket.ts          # WebSocket client
│   │   ├── types.ts              # Type definitions
│   │   └── hooks/                # React hooks for data
│   │       ├── useOrderBook.ts   # Order book hook
│   │       ├── useTrades.ts      # Trades hook
│   │       └── useMarketData.ts  # Market data hook
│   ├── redis/
│   │   ├── redis.ts              # Redis client
│   │   └── services/             # Data services
│   │       ├── tradesService.ts
│   │       ├── positionsService.ts
│   │       ├── alertsService.ts
│   │       └── orderbookService.ts
│   └── theme/
│       └── colors.ts             # Unified color scheme
└── widgets/                      # Dashboard widgets
```

## 🎨 Architecture

### Data Flow

```
Hyperliquid DEX
      ↓ WebSocket/REST
Hyperliquid Client (lib/hyperliquid/)
      ↓ Real-time data
React Hooks (useOrderBook, useTrades, etc.)
      ↓ Processed data
UI Components (Modules 1-6)
      ↓ User actions
Asset Context (BTC/ETH/HYPE)
      ↓ Store historical data
Redis Services (optional)
```

### Key Components

**1. Asset Context Provider**
- Manages current asset selection (BTC/ETH/HYPE)
- Provides formatting utilities
- Shared across all modules

**2. WebSocket Client**
- Singleton pattern for connection management
- Auto-reconnection with exponential backoff
- Type-safe subscription management

**3. React Hooks**
- `useOrderBook`: Real-time order book data
- `useTrades`: Live trade feed
- `useMarketData`: Prices, funding, OI
- Automatic cleanup on unmount

**4. Redis Services**
- Optional data persistence layer
- Time-series data storage
- Query utilities for historical analysis

## 🔌 API Integration

### Hyperliquid WebSocket Subscriptions

```typescript
import { getWSClient } from '@/lib/hyperliquid/websocket';

const wsClient = getWSClient();
await wsClient.connect();

// Subscribe to order book
wsClient.subscribeToOrderBook('BTC', (snapshot) => {
  console.log('Order book update:', snapshot);
});

// Subscribe to trades
wsClient.subscribeToTrades('BTC', (trades) => {
  console.log('New trades:', trades);
});

// Subscribe to all mids
wsClient.subscribeToAllMids((mids) => {
  console.log('Mid prices:', mids);
});
```

### Using React Hooks

```typescript
import { useOrderBook, useTrades, useMarketData } from '@/lib/hyperliquid/hooks';

function MyComponent() {
  const { orderBook, isLoading, error } = useOrderBook(15);
  const { trades, stats } = useTrades(100);
  const { marketData } = useMarketData();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Current Price: ${orderBook.currentPrice}</h2>
      <p>Spread: {orderBook.spreadPercent}%</p>
    </div>
  );
}
```

## 🎯 Usage

### Accessing the Platform

1. **Home Dashboard**: View all widgets and quick access to institutional analysis
2. **Institutional Analysis**: Click "Open Analysis Platform" to access detailed modules
3. **Asset Selection**: Use the toggle at the top right to switch between BTC/ETH/HYPE
4. **Module Navigation**: Use tabs to switch between different analysis views

### Module 1: Liquidity & Order Book

- **Real-time order book** with bid/ask levels
- **Mid price** and spread percentage
- **Volume imbalance** indicator (bid vs ask)
- **Large order detection** (orders 3x+ average)
- **Live updates** every few seconds

## 🚀 Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

The build will:
- Optimize bundle sizes
- Generate static pages where possible
- Enable production optimizations

## 🔐 Security Notes

- **No Private Keys**: This dashboard is read-only and does not require private keys
- **Public Data**: Only accesses public Hyperliquid market data
- **Optional Redis**: Redis is not required; app works without it
- **Environment Variables**: Keep `.env.local` out of version control

## 🐛 Troubleshooting

### Redis Connection Errors

If you see Redis connection errors during build:
- This is normal if Redis is not running
- The app will work fine without Redis (data persistence disabled)
- To suppress warnings, either:
  1. Start Redis, or
  2. Remove `REDIS_URL` from `.env.local`

### WebSocket Connection Issues

If WebSocket connections fail:
- Check your internet connection
- Verify `HYPERLIQUID_TESTNET` is set correctly
- Check firewall settings (WebSocket uses port 443)

### Build Errors

If you encounter TypeScript errors:
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

## 📝 Development

### Adding New Modules

1. Create module directory in `components/institutional-analysis/`
2. Use existing modules as templates
3. Integrate with asset context and real-time hooks
4. Add to navigation in `app/institutional-analysis/page.tsx`

### Extending Data Services

1. Add new service in `lib/redis/services/`
2. Export from `lib/redis/services/index.ts`
3. Use in components via import

## 🤝 Contributing

This is a demonstration project showcasing real-time Hyperliquid integration. Feel free to fork and extend!

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [Hyperliquid](https://hyperliquid.xyz/) for the DEX and API
- [@nktkas/hyperliquid](https://www.npmjs.com/package/@nktkas/hyperliquid) for the excellent SDK
- Next.js and React teams for the framework

## 📧 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the code examples in this README
3. Open an issue on GitHub

---

**Built with ❤️ for the Hyperliquid community**
