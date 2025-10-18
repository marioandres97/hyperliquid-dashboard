/**
 * Sentry Client Configuration
 */
import * as Sentry from '@sentry/nextjs';
import { config } from './lib/core/config';

if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.sentry.environment,
    
    // Performance monitoring
    tracesSampleRate: config.sentry.tracesSampleRate,
    
    // Session Replay
    replaysSessionSampleRate: config.sentry.replaysSessionSampleRate,
    replaysOnErrorSampleRate: config.sentry.replaysOnErrorSampleRate,
    
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Don't report errors in development
    enabled: config.env === 'production' || config.env === 'staging',
  });
}
