# Database Setup and Migration Guide

This project uses Prisma ORM with PostgreSQL for production data persistence.

## Prerequisites

- PostgreSQL 12 or higher
- Node.js 18 or higher

## Environment Configuration

Add the following environment variables to your `.env` file:

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/hyperliquid?schema=public
DATABASE_MAX_CONNECTIONS=10
DATABASE_CONNECTION_TIMEOUT=10000
```

## Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

3. **Run migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

## Database Schema

The database includes the following models:

### User
Tracks dashboard users with their addresses and tier information.

### Session
Manages user sessions for rate limiting and analytics.

### Alert
Stores price and funding rate alerts configured by users.

### TradeSnapshot
Historical trade data for analytics.

### PositionSnapshot
Historical position data for tracking.

### HealthMetric
System health metrics over time.

## Migration Commands

### Create a new migration
```bash
npx prisma migrate dev --name <migration_name>
```

### Apply migrations in production
```bash
npx prisma migrate deploy
```

### Reset database (development only)
```bash
npx prisma migrate reset
```

### View migration status
```bash
npx prisma migrate status
```

## Prisma Studio

To explore and edit your data in a GUI:

```bash
npx prisma studio
```

This will open Prisma Studio at http://localhost:5555

## Production Deployment

1. Ensure `DATABASE_URL` is configured in production environment
2. Run migrations before deploying new code:
   ```bash
   npx prisma migrate deploy
   ```
3. Generate Prisma Client as part of build:
   ```bash
   npx prisma generate
   ```

## Backup and Restore

### Backup
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Restore
```bash
psql $DATABASE_URL < backup.sql
```

## Monitoring

The application includes database health checks in the `/api/health` endpoint. Monitor:
- Connection status
- Query latency
- Connection pool usage

## Troubleshooting

### Connection Issues

If you see "Database not available" messages:

1. Check that PostgreSQL is running
2. Verify `DATABASE_URL` is correctly configured
3. Ensure the database exists
4. Check network connectivity to database server

### Migration Issues

If migrations fail:

1. Check migration status: `npx prisma migrate status`
2. Review error messages in logs
3. Ensure database user has sufficient permissions
4. Consider using `npx prisma migrate resolve` for failed migrations

### Performance

For production deployments:

1. Enable connection pooling (e.g., PgBouncer)
2. Monitor query performance with `EXPLAIN ANALYZE`
3. Add indexes for frequently queried columns
4. Adjust `DATABASE_MAX_CONNECTIONS` based on load
