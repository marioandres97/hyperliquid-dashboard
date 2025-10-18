# Premium Liquidity Flow Map - Features Documentation

## Overview
The Premium Liquidity Flow Map is a Bloomberg Terminal-inspired, canvas-based visualization system for real-time liquidity analysis on Hyperliquid DEX.

## Key Features

### 🎨 Premium Design System
- **Deep Black Background** (#0A0E17): Professional trading terminal aesthetic
- **Gold Accents** (#F59E0B): Premium highlights for key elements
- **Glassmorphism UI**: Modern frosted glass effects with backdrop filters
- **Trading Colors**: 
  - Buy: Emerald green (#10B981)
  - Sell: Red (#EF4444)
  - Neutral: Gray (#6B7280)

### ⚡ Canvas-Based Rendering
- **High Performance**: 60 FPS smooth rendering using HTML5 Canvas
- **Optimized for Scale**: Handles thousands of price levels without lag
- **High DPI Support**: Automatic pixel ratio detection for retina displays
- **Memory Efficient**: Virtual scrolling for large datasets

### 📊 Premium Heatmap Component
Located at: `widgets/liquidity-flow-map/components/premium/PremiumLiquidityHeatmap.tsx`

**Features:**
- Canvas-based rendering for smooth performance
- Interactive zoom controls (+/-, Reset button)
- Keyboard shortcuts (+ zoom in, - zoom out, R reset)
- Hover tooltips with detailed trade information
- Whale activity indicators (gold dots)
- Real-time price marker with glow effect
- Volume profile visualization
- Buy/sell pressure bars

**Props:**
```typescript
interface PremiumLiquidityHeatmapProps {
  nodes: Map<number, LiquidityNode>;
  currentPrice?: number;
  absorptionZones?: AbsorptionZone[];
  supportResistanceLevels?: SupportResistanceLevel[];
  showPatterns?: boolean;
  height?: number;
  priceRange?: [number, number];
}
```

### 💎 Premium Metrics Cards
Located at: `widgets/liquidity-flow-map/components/premium/PremiumMetricsCard.tsx`

**Features:**
- Glassmorphism background
- Color-coded by trade type
- Trend indicators (up/down/neutral arrows)
- Custom icons support
- Hover scale animation

**Props:**
```typescript
interface PremiumMetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'buy' | 'sell' | 'neutral' | 'gold';
}
```

### 📈 Time & Sales Component
Located at: `widgets/liquidity-flow-map/components/premium/PremiumTimeAndSales.tsx`

**Features:**
- Real-time trade feed with fade-in animations
- Color-coded buy/sell indicators
- Whale trade highlighting
- Scrollable trade history
- Trade statistics footer

**Props:**
```typescript
interface PremiumTimeAndSalesProps {
  trades: ClassifiedTrade[];
  maxTrades?: number;
}
```

### 📖 Order Book Component
Located at: `widgets/liquidity-flow-map/components/premium/PremiumOrderBook.tsx`

**Features:**
- Visual depth representation with background bars
- Real-time spread calculation
- Cumulative volume display
- Buy/sell order separation
- Color-coded price levels

**Props:**
```typescript
interface PremiumOrderBookProps {
  nodes: Map<number, LiquidityNode>;
  currentPrice?: number;
  depth?: number;
}
```

## Animation System

### Framer Motion Integration
All premium components use Framer Motion for smooth animations:

**Available Variants:**
- `containerVariants`: Staggered children animations
- `itemVariants`: Fade-in from bottom
- `heatmapVariants`: Slide-in from left with spring
- `pulseAnimation`: Continuous pulse for live elements
- `shimmerAnimation`: Loading state animation

**Example Usage:**
```tsx
<motion.div
  variants={itemVariants}
  initial="hidden"
  animate="show"
>
  {/* content */}
</motion.div>
```

## Canvas Rendering System

### HeatmapRenderer
Location: `widgets/liquidity-flow-map/utils/canvas/heatmapRenderer.ts`

**Capabilities:**
- Background gradients
- Grid lines
- Price labels with formatting
- Volume bars with gradients
- Node rendering with intensity mapping
- Whale activity markers

### VolumeProfileRenderer
Location: `widgets/liquidity-flow-map/utils/canvas/volumeProfileRenderer.ts`

**Features:**
- Vertical volume histogram
- POC (Point of Control) marker
- Buy/sell volume split visualization

### AnimationEngine
Location: `widgets/liquidity-flow-map/utils/canvas/animationEngine.ts`

**Capabilities:**
- Particle effects for trades
- requestAnimationFrame-based updates
- Automatic cleanup on unmount

## Hooks

### usePremiumHeatmap
Location: `widgets/liquidity-flow-map/hooks/usePremiumHeatmap.ts`

**Provides:**
- Sorted node array
- Calculated metrics (max volumes, totals)
- Price range calculation
- Zoom controls (zoomIn, zoomOut, resetZoom)
- Scroll controls

### useCanvasRenderer
Location: `widgets/liquidity-flow-map/hooks/useCanvasRenderer.ts`

**Provides:**
- Canvas ref
- 2D context
- Pixel ratio detection
- Automatic DPI scaling
- Render function

## Keyboard Shortcuts

### Heatmap Controls
- `+` or `=`: Zoom in
- `-` or `_`: Zoom out
- `r` or `R`: Reset zoom level

## Theme Customization

### Color System
Location: `lib/theme/premium-colors.ts`

Modify the `premiumTheme` object to customize:
- Background colors
- Accent colors
- Trading colors (buy/sell/neutral)
- Border styles
- Effect styles

### Effects
Location: `lib/effects/premium-effects.ts`

Available effect functions:
- `glowEffect(color, intensity)`: Add glow to elements
- `glassEffect(opacity)`: Apply glassmorphism
- Animation variants for Framer Motion

## Performance Optimization

### Best Practices
1. **Memoization**: All heavy computations use `useMemo`
2. **Virtual Scrolling**: Only visible nodes are rendered
3. **Debounced Updates**: User interactions are debounced
4. **RAF Animations**: Canvas animations use requestAnimationFrame
5. **SSR Compatible**: All window references are guarded

### Metrics
- **Target FPS**: 60 FPS
- **Max Nodes**: 10,000+ without performance degradation
- **Bundle Size**: ~40KB gzipped (premium components only)

## Usage Example

```tsx
import { useState } from 'react';
import { 
  PremiumLiquidityHeatmap,
  PremiumMetricsCard,
  PremiumTimeAndSales,
  PremiumOrderBook 
} from '@/widgets/liquidity-flow-map/components/premium';
import { useLiquidityFlowData } from '@/widgets/liquidity-flow-map/hooks';

function MyTradingDashboard() {
  const [coin, setCoin] = useState('BTC');
  const { flowData, metrics } = useLiquidityFlowData({ coin });
  
  return (
    <div>
      {/* Metrics */}
      <PremiumMetricsCard
        title="Total Volume"
        value="$1.2M"
        color="gold"
        trend="up"
      />
      
      {/* Heatmap */}
      <PremiumLiquidityHeatmap
        nodes={flowData.nodes}
        currentPrice={65000}
        showPatterns={true}
      />
      
      {/* Time & Sales */}
      <PremiumTimeAndSales
        trades={flowData.trades}
        maxTrades={50}
      />
      
      {/* Order Book */}
      <PremiumOrderBook
        nodes={flowData.nodes}
        currentPrice={65000}
        depth={10}
      />
    </div>
  );
}
```

## Integration with Existing System

### Backward Compatibility
The premium system is fully backward compatible:

```tsx
// Old way (still works)
<LiquidityHeatmap nodes={nodes} />

// New way (opt-in to premium)
<LiquidityHeatmap nodes={nodes} usePremium={true} />
```

### Real-time Data Flow
All existing WebSocket connections and data hooks remain unchanged:
- ✅ `useLiquidityFlowData` hook
- ✅ Trade collector service
- ✅ Liquidation collector service
- ✅ Pattern detection
- ✅ All real-time updates

## Browser Support

- **Chrome/Edge**: Full support ✅
- **Firefox**: Full support ✅
- **Safari**: Full support ✅ (with webkit prefixes)
- **Mobile**: Partial support (touch interactions not yet implemented)

## Future Enhancements

Potential additions for Phase 2:
- [ ] Touch gestures for mobile
- [ ] Advanced chart tools (drawing tools, indicators)
- [ ] Sound notifications for whale trades
- [ ] Export functionality (PNG, CSV)
- [ ] Custom color themes
- [ ] WebGL renderer for even better performance
- [ ] Real-time trade particle effects with confetti
- [ ] Multi-timeframe analysis
- [ ] Alert system for price levels

## Troubleshooting

### Canvas not rendering
- Check that container has explicit dimensions
- Verify browser supports Canvas 2D
- Check console for errors

### Performance issues
- Reduce visible node count
- Increase scroll offset granularity
- Disable animations if needed
- Use production build (dev mode is slower)

### SSR errors
- Ensure all window references are guarded with `typeof window !== 'undefined'`
- Use 'use client' directive for client components

## Contributing

When adding new premium components:
1. Follow the existing naming convention (`Premium*.tsx`)
2. Use the premium theme colors from `lib/theme/premium-colors.ts`
3. Add Framer Motion animations for smooth UX
4. Export from `components/premium/index.ts`
5. Add TypeScript interfaces for props
6. Document in this file

## License

Same as parent project (see root LICENSE file)
