# Visual Design Specifications

## Real-Time Prices Widget - Before & After

### BEFORE (Old Design)
```
┌─────────────────────────────────────────┐
│ $ BTC                        [v]    ●   │
│                                         │
│ $97,234.50                              │
│ ↗ +2.45%  24h                          │
│                                         │
│ [Expand/Collapse Chart]                 │
│                                         │
│ 24h High: $98,123.45                    │
│ 24h Low:  $95,432.10                    │
└─────────────────────────────────────────┘

Issues:
- Basic card design
- Expand/collapse needed
- Too much vertical space when expanded
- Not premium look
- Flat colors
```

### AFTER (New Premium Design)

#### Desktop View (≥768px)
```
┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
│ BTC  Bitcoin  ●🟢│  │ ETH  Ethereum ●🟢│  │ HYPE  Hyperliq●🟢│
│                   │  │                   │  │                   │
│  $97,234.50       │  │  $3,456.78        │  │  $15.89          │
│                   │  │                   │  │                   │
│  ▲ +2.45% 24h    │  │  ▲ +1.23% 24h    │  │  ▼ -0.87% 24h    │
│                   │  │                   │  │                   │
│  ╱╲╱╲╱╲╱╲        │  │  ╱╲╱╲╱╲╱╲        │  │  ╲╱╲╱╲╱╲╱        │
│ ▁▂▃▄▅▆▇█▇▆▅▄     │  │ ▁▂▃▄▅▆▇█▇▆▅▄     │  │ ▇▆▅▄▃▂▁▂▃▄       │
└───────────────────┘  └───────────────────┘  └───────────────────┘

Glassmorphism with subtle glow borders
All three cards always visible
No expand/collapse needed
Premium typography and spacing
```

#### Mobile View (<768px) - Carousel
```
        Swipe ← →
┌─────────────────────┐
│ BTC  Bitcoin    ●🟢 │
│                     │
│   $97,234.50        │
│                     │
│   ▲ +2.45% 24h     │
│                     │
│   ╱╲╱╲╱╲╱╲         │
│  ▁▂▃▄▅▆▇█▇▆▅▄      │
│                     │
│      • ○ ○          │  ← Dot indicators
└─────────────────────┘

One coin visible at a time
Swipe left/right to navigate
Smooth transitions
Touch-optimized
```

## Design Elements Breakdown

### Typography Hierarchy
```
Coin Symbol:      text-xl md:text-2xl font-bold
                  BTC

Coin Name:        text-sm text-white/40 font-medium
                  Bitcoin

Price:            text-5xl md:text-6xl lg:text-7xl font-extrabold
                  $97,234.50

24h Change:       text-base font-bold
                  +2.45%

24h Label:        text-sm text-white/30 font-medium
                  24h
```

### Color Palette
```
Background:       Glassmorphism
                  - bg-gradient-to-br from-white/[0.08] to-white/[0.02]
                  - backdrop-blur-xl

Border:           Subtle gradient
                  - from-white/20 via-white/5 to-transparent
                  - opacity-50

Inner BG:         from-gray-900/90 to-gray-900/70

Glow (Hover):     
  Positive:       bg-green-500/20
  Negative:       bg-red-500/20

Text Colors:
  Primary:        text-white
  Secondary:      text-white/40
  Tertiary:       text-white/30
  Positive:       text-green-400
  Negative:       text-red-400

Live Indicator:   bg-green-400 with animate-ping
```

### Spacing & Layout
```
Card Padding:     p-6 md:p-8
Card Min Height:  min-h-[320px]
Grid Gap:         gap-4 lg:gap-6
Border Radius:    rounded-2xl

Desktop Grid:     grid-cols-1 md:grid-cols-3
Mobile:           Full width carousel
```

### Animations
```
Card Entry:       
  - initial: { opacity: 0, y: 20 }
  - animate: { opacity: 1, y: 0 }
  - duration: 0.5s

Price Update:
  - scale: [1, 1.02, 1]
  - duration: 0.3s

Hover Glow:
  - opacity: 0 → 1
  - duration: 0.5s
  - blur: xl

Live Indicator:
  - animate-ping (continuous)

Carousel:
  - initial: { opacity: 0, x: 50 }
  - animate: { opacity: 1, x: 0 }
  - exit: { opacity: 0, x: -50 }
  - duration: 0.3s, ease: easeInOut
```

### Sparkline Specifications
```
Dimensions:       width: 100, height: 30 (viewBox)
Data Points:      Last 20 price updates
Update Frequency: Every price change from WebSocket

Gradient Fill:
  Positive (Green):
    - Top: #22c55e at 30% opacity
    - Bottom: #22c55e at 0% opacity
  
  Negative (Red):
    - Top: #ef4444 at 30% opacity
    - Bottom: #ef4444 at 0% opacity

Line Stroke:
  Positive: stroke="#22c55e"
  Negative: stroke="#ef4444"
  Width: 2px
  Style: rounded caps/joins

SVG Features:
  - Unique gradient ID per card instance
  - Smooth curve transitions
  - Drop shadow on line
  - Normalized to min/max range
```

## Toast Notification System

### Toast Types & Colors
```
Success:
┌────────────────────────────┐
│ ✓ Trade saved successfully!│  ← Green bg/border
└────────────────────────────┘

Error:
┌────────────────────────────┐
│ ✗ Failed to save trade     │  ← Red bg/border
└────────────────────────────┘

Info:
┌────────────────────────────┐
│ ℹ Processing your request  │  ← Blue bg/border
└────────────────────────────┘

Warning:
┌────────────────────────────┐
│ ⚠ Connection unstable      │  ← Yellow bg/border
└────────────────────────────┘
```

### Toast Specifications
```
Position:         fixed top-4 right-4
Z-index:          z-[100]
Min Width:        300px
Max Width:        400px
Padding:          px-4 py-3
Border Radius:    rounded-lg
Border:           1px solid
Backdrop:         backdrop-blur-sm
Shadow:           shadow-lg

Animation:
  Enter:  opacity: 0, y: -20, scale: 0.95 → opacity: 1, y: 0, scale: 1
  Exit:   opacity: 1, x: 0, scale: 1 → opacity: 0, x: 100, scale: 0.95
  Duration: 0.2s

Auto-dismiss:     3000ms (3 seconds)
Manual dismiss:   X button (hover: bg-white/10)
```

## Responsive Breakpoints

### Mobile (<768px)
- Single card carousel
- Full width
- Larger touch targets (44x44px minimum)
- Swipe gestures enabled
- Dot navigation at bottom

### Tablet (768px - 1023px)
- 3-card grid
- Responsive padding (p-6)
- Medium font sizes
- Touch-friendly

### Desktop (≥1024px)
- 3-card grid
- Generous padding (p-8)
- Largest font sizes
- Hover effects enabled

### Large Desktop (≥1920px)
- 3-card grid maintained
- Maximum spacing (gap-6)
- No layout changes (scales naturally)

## Accessibility Features

### ARIA Labels
```html
<button aria-label="Go to slide 1">
<button aria-label="Close notification">
<div aria-live="polite">  <!-- For toasts -->
```

### Keyboard Navigation
- Tab through carousel dots
- Enter/Space to select
- Escape to dismiss toasts
- Focus indicators visible

### Color Contrast
- Text on backgrounds: ≥7:1 (AAA)
- Interactive elements: ≥4.5:1 (AA)
- Disabled states: Clear visual difference

### Screen Reader Support
- Semantic HTML (button, nav, etc.)
- Meaningful text alternatives
- Status announcements for toasts

## Performance Optimizations

### React Optimizations
```typescript
// Memoized calculations
const sparklinePath = useMemo(() => {...}, [sparklineData]);
const gradientId = useMemo(() => {...}, [coin, instanceId]);

// Efficient state updates
setSparklineData(prev => {...}); // Functional updates

// Proper cleanup
useEffect(() => {
  return () => clearInterval(interval);
}, []);
```

### CSS Performance
- GPU-accelerated transforms
- Will-change hints where needed
- Efficient selectors
- Minimal repaints/reflows

### Bundle Size
- Code splitting enabled
- Tree shaking active
- Minification in production
- Gzip compression

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

All modern browsers with:
- CSS Grid support
- Backdrop-filter support
- Touch events
- Modern JavaScript (ES2020+)
