/**
 * Sentry Edge Configuration
 */
import * as Sentry from '@sentry/nextjs';

// Edge runtime has limited environment variable access
const sentryDsn = process.env.SENTRY_DSN;
const environment = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment,
    
    // Performance monitoring
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    
    // Don't report errors in development
    enabled: environment === 'production' || environment === 'staging',
  });
}
