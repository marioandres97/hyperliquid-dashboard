# Multi-Layer Caching & Rate Limiting

This document describes the caching and rate limiting features implemented in this application.

## Overview

The application uses a 3-layer caching architecture to optimize performance:
- **Layer 1 (Memory)**: Ultra-fast (<1ms) in-memory cache for hot data
- **Layer 2 (Redis)**: Fast (~10-15ms) distributed cache for shared data
- **Layer 3 (Source)**: Fetch from database or external API (100-500ms)

## Cache Configuration

Configure caching via environment variables:

```bash
# Memory Cache
CACHE_MEMORY_ENABLED=true
CACHE_MEMORY_MAX_SIZE=50        # Max size in MB
CACHE_MEMORY_TTL=10              # Default TTL in seconds

# Redis Cache
CACHE_REDIS_TTL=30               # Default TTL in seconds

# Cache Warming
CACHE_WARM_ON_STARTUP=true      # Pre-populate cache on startup
```

## Cache Keys Strategy

The application uses a structured key naming convention:

```
market:{asset}:price              # Current price
market:{asset}:trades:{limit}     # Recent trades
analytics:{asset}:cvd:{hours}h    # CVD calculation
analytics:{asset}:metrics         # Market metrics
```

## TTL Strategy

Different data types use different TTL values:

| Data Type | Memory TTL | Redis TTL | Reason |
|-----------|------------|-----------|--------|
| Prices | 5s | 10s | Frequently updated |
| Trades | 10s | 30s | Less volatile |
| CVD | - | 30s | Expensive calculation |
| Orderbook | 5s | 15s | High volatility |
| Analytics | - | 60s | Expensive calculation |

## Using the Cache Service

```typescript
import { cacheService } from '@/lib/services/cacheService';

// Get with automatic fallback
const data = await cacheService.get(
  'market:BTC:price',
  async () => {
    // Fetch from source if not cached
    return await fetchPriceFromAPI('BTC');
  },
  { ttl: 10, layer: 'both' }
);

// Set value directly
await cacheService.set('my-key', myValue, 60, 'redis');

// Invalidate by pattern
await cacheService.invalidate('market:BTC:*');

// Get statistics
const stats = await cacheService.getStats();
console.log(`Cache hit rate: ${stats.overall.hitRate}%`);
```

## Rate Limiting

The application implements Redis-backed rate limiting with multiple tiers:

### Rate Limit Tiers

| Tier | Requests | Window |
|------|----------|--------|
| Free | 60 | 60s |
| Pro | 300 | 60s |
| Api | 1000 | 60s |
| Unlimited | 10000 | 60s |

### Configuration

```bash
RATE_LIMIT_ENABLED=true
RATE_LIMIT_FREE_REQUESTS=60
RATE_LIMIT_PRO_REQUESTS=300
RATE_LIMIT_API_REQUESTS=1000
RATE_LIMIT_WINDOW_SECONDS=60
```

### Rate Limit Headers

All API responses include rate limit headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1737233767
```

When rate limit is exceeded, you'll receive a 429 response:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "statusCode": 429,
    "context": {
      "limit": 60,
      "window": 60,
      "retryAfter": 30
    }
  }
}
```

### Excluded Endpoints

The following endpoints are excluded from rate limiting:
- `/api/health` - Health check endpoint

## Cache Warming

The cache warmer pre-populates the cache with popular data on startup and refreshes every 5 minutes.

### Warmed Assets

- BTC (Bitcoin)
- ETH (Ethereum)
- HYPE (Hyperliquid)

### Warmed Data

For each asset, the following data is pre-cached:
- Current price
- Recent trades
- CVD calculations
- Market metrics

### Manual Cache Warming

```typescript
import { cacheWarmer } from '@/lib/jobs/cacheWarmer';

// Warm cache for a specific asset
await cacheWarmer.warmAsset('BTC');

// Warm cache for all main assets
await cacheWarmer.warmAll();

// Check warming status
const status = cacheWarmer.getStatus();
console.log(`Warming: ${status.isWarming}, Scheduled: ${status.isScheduled}`);
```

## Monitoring

### Cache Stats Endpoint

Get cache performance metrics:

```bash
GET /api/cache/stats
```

Response:
```json
{
  "memory": {
    "hits": 1234,
    "misses": 56,
    "hitRate": 95.6,
    "size": "12.5MB",
    "keys": 45
  },
  "redis": {
    "hits": 5678,
    "misses": 123,
    "hitRate": 97.9
  },
  "overall": {
    "hitRate": 97.2
  }
}
```

## Performance Targets

Expected performance improvements with caching:

| Operation | Before | After | Improvement |
|-----------|--------|-------|-------------|
| Price fetch | ~200ms | <10ms | 95% faster |
| Trades fetch | ~500ms | <20ms | 96% faster |
| CVD calculation | ~300ms | <15ms | 95% faster |

Rate limiting overhead: <2ms per request

## Best Practices

1. **Use appropriate TTL**: Short TTL for frequently changing data, longer for stable data
2. **Cache invalidation**: Invalidate cache when data is updated
3. **Monitor hit rate**: Aim for >80% hit rate after warmup
4. **Handle cache misses**: Ensure your fetcher function handles errors gracefully
5. **Test without cache**: Verify functionality works with cache disabled

## Troubleshooting

### High cache miss rate

- Check if TTL is too short
- Verify cache warming is enabled
- Check Redis connectivity
- Review cache key patterns

### Memory cache too large

- Reduce `CACHE_MEMORY_MAX_SIZE`
- Use `layer: 'redis'` for large datasets
- Implement more aggressive eviction

### Rate limiting too strict

- Adjust tier limits in config
- Implement user authentication for higher tiers
- Review request patterns

## Initialization

To enable cache warming on application startup, call the initialization function:

```typescript
import { initializeApp, cleanupApp } from '@/lib/init';

// On startup
await initializeApp();

// On shutdown
await cleanupApp();
```
