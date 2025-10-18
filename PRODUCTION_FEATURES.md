# Production Features

This document describes the production-ready features added to the Hyperliquid Dashboard.

## Table of Contents

1. [Database Layer (Prisma ORM)](#database-layer-prisma-orm)
2. [Error Monitoring (Sentry)](#error-monitoring-sentry)
3. [Graceful Shutdown](#graceful-shutdown)
4. [Enhanced Health Checks](#enhanced-health-checks)
5. [Repository Pattern](#repository-pattern)
6. [Testing Suite](#testing-suite)
7. [Configuration Management](#configuration-management)

## Database Layer (Prisma ORM)

### Overview
Production-ready database layer using Prisma ORM with PostgreSQL for persistent data storage.

### Features
- Type-safe database queries with Prisma Client
- Automated migrations
- Connection pooling
- Query optimization
- Database health monitoring

### Setup
See [DATABASE.md](./DATABASE.md) for detailed setup instructions.

### Models
- **User**: Dashboard user accounts
- **Session**: User session tracking
- **Alert**: Price and funding alerts
- **TradeSnapshot**: Historical trade data
- **PositionSnapshot**: Historical position data
- **HealthMetric**: System health metrics

## Error Monitoring (Sentry)

### Overview
Comprehensive error tracking and performance monitoring with Sentry.

### Features
- Automatic error capture
- Performance monitoring
- Session replay (production only)
- Source maps for debugging
- Breadcrumb tracking

### Configuration

```bash
# .env
SENTRY_DSN=your_sentry_dsn
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1
SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=1.0
```

### Integration
- Client-side: `sentry.client.config.ts`
- Server-side: `sentry.server.config.ts`
- Edge runtime: `sentry.edge.config.ts`

## Graceful Shutdown

### Overview
Proper cleanup of resources on application shutdown.

### Features
- Signal handling (SIGTERM, SIGINT)
- Database connection cleanup
- Redis connection cleanup
- Custom shutdown handlers
- Graceful timeout handling

### Implementation
```typescript
import { setupShutdownListeners } from '@/lib/core/shutdown';

// Setup during initialization
setupShutdownListeners();
```

### Supported Signals
- **SIGTERM**: Graceful shutdown (Docker, Kubernetes)
- **SIGINT**: Ctrl+C interrupt
- **uncaughtException**: Unhandled errors
- **unhandledRejection**: Unhandled promise rejections

## Enhanced Health Checks

### Overview
Comprehensive health monitoring endpoint at `/api/health`.

### Response Format
```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": 1234567890,
  "uptime": 3600000,
  "version": "0.1.0",
  "environment": "production",
  "memory": {
    "heapUsed": 50,
    "heapTotal": 100,
    "rss": 150,
    "external": 10
  },
  "services": {
    "database": {
      "available": true,
      "connected": true,
      "latency": 5
    },
    "redis": {
      "available": true,
      "connected": true,
      "latency": 2
    },
    "websocket": {
      "connected": true
    },
    "hyperliquidApi": {
      "reachable": true,
      "latency": 100
    }
  }
}
```

### Status Codes
- **200**: Healthy or degraded (services operational)
- **503**: Unhealthy (critical service down)

### Monitoring
Use this endpoint for:
- Kubernetes liveness/readiness probes
- Load balancer health checks
- Monitoring systems (Prometheus, DataDog, etc.)

## Repository Pattern

### Overview
Clean separation of data access logic using the repository pattern.

### Benefits
- Testability: Easy to mock for testing
- Maintainability: Centralized data access
- Type safety: Full TypeScript support
- Flexibility: Easy to swap implementations

### Example Usage
```typescript
import { userRepository } from '@/lib/database/repositories/user.repository';

// Find user by address
const user = await userRepository.findByAddress('0x123...');

// Create new user
const newUser = await userRepository.create({
  address: '0x456...',
  tier: 'pro'
});

// Update user
await userRepository.update(userId, { tier: 'api' });
```

### Available Repositories
- `UserRepository`: User management
- `AlertRepository`: Alert management

## Testing Suite

### Overview
Comprehensive testing with Vitest achieving 70%+ coverage for new code.

### Test Types

#### Unit Tests
```bash
npm test
```
- Core modules (70.08% coverage)
- Repositories (74% coverage)
- Utilities
- Services

#### Integration Tests
Tests for API endpoints and service integration.

#### Coverage Report
```bash
npm run test:coverage
```

### Test Structure
```
tests/
├── unit/
│   ├── core/          # Core functionality tests
│   ├── database/      # Database and repository tests
│   ├── services/      # Service layer tests
│   └── utils/         # Utility function tests
└── integration/
    └── api/           # API endpoint tests
```

### Key Metrics
- **Overall Core**: 70.08% coverage
- **Config Module**: 94.16% coverage
- **Logger Module**: 98.55% coverage
- **Errors Module**: 100% coverage
- **Repositories**: 74% coverage

## Configuration Management

### Overview
Centralized, validated configuration with Zod schema validation.

### Features
- Environment variable validation
- Type-safe configuration
- Default values
- Fail-fast on invalid config

### Configuration Sections

#### Database
```bash
DATABASE_URL=postgresql://...
DATABASE_MAX_CONNECTIONS=10
DATABASE_CONNECTION_TIMEOUT=10000
```

#### Sentry
```bash
SENTRY_DSN=https://...
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
```

#### Redis
```bash
REDIS_URL=redis://localhost:6379
REDIS_MAX_RETRIES=3
```

#### Features
```bash
RATE_LIMIT_ENABLED=true
ANALYTICS_ENABLED=true
```

### Usage
```typescript
import { config } from '@/lib/core/config';

// Access validated config
const dbUrl = config.database.url;
const sentryDsn = config.sentry.dsn;
```

## Deployment Checklist

### Pre-deployment
- [ ] Configure `DATABASE_URL`
- [ ] Configure `SENTRY_DSN`
- [ ] Run database migrations
- [ ] Generate Prisma Client
- [ ] Run tests
- [ ] Build application

### Production
- [ ] Enable health checks in load balancer
- [ ] Monitor error rates in Sentry
- [ ] Set up database backups
- [ ] Configure connection pooling
- [ ] Enable logging aggregation
- [ ] Set up alerts for service degradation

### Monitoring
- [ ] Health endpoint: `/api/health`
- [ ] Error tracking: Sentry dashboard
- [ ] Database metrics: Connection pool, query latency
- [ ] Memory usage: Heap size, RSS
- [ ] API latency: Service response times

## Performance Considerations

### Database
- Connection pooling enabled
- Query optimization with indexes
- Prepared statements via Prisma
- Read replicas for scaling (if needed)

### Memory
- Memory metrics tracked in health checks
- Graceful cleanup on shutdown
- Connection pool limits

### Error Handling
- All errors captured by Sentry
- Graceful degradation when services unavailable
- Circuit breaker pattern for external services

## Security

### Database
- Parameterized queries (Prisma)
- Connection string encryption
- Least privilege database user

### Configuration
- Environment variables for secrets
- No hardcoded credentials
- Validation on startup

### Error Monitoring
- Sensitive data masked
- Stack traces sanitized
- PII filtering enabled

## Support

For issues or questions:
1. Check health endpoint status
2. Review Sentry error logs
3. Verify environment configuration
4. Check database connectivity
5. Review application logs
