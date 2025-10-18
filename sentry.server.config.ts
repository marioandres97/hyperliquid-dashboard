/**
 * Sentry Server Configuration
 */
import * as Sentry from '@sentry/nextjs';
import { config } from './lib/core/config';

if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.sentry.environment,
    
    // Performance monitoring
    tracesSampleRate: config.sentry.tracesSampleRate,
    
    // Don't report errors in development
    enabled: config.env === 'production' || config.env === 'staging',
  });
}
