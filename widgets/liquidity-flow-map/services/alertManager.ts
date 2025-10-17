// Alert system for detecting and managing market alerts

import {
  Alert,
  AlertConfig,
  AlertSeverity,
  PatternType,
  Coin,
  AbsorptionZone,
  LiquidationCascade,
  SupportResistanceLevel,
  DetectedPattern,
} from '../types';

/**
 * Alert manager for creating and managing alerts
 */
export class AlertManager {
  private alerts: Map<string, Alert> = new Map();
  private config: AlertConfig;
  private listeners: Set<(alert: Alert) => void> = new Set();

  constructor(config?: Partial<AlertConfig>) {
    this.config = {
      enabled: true,
      minSeverity: 'low',
      patterns: [
        'absorption_zone',
        'liquidation_cascade',
        'support_level',
        'resistance_level',
        'whale_accumulation',
        'whale_distribution',
        'breakout',
        'breakdown',
      ],
      notificationSound: true,
      autoAcknowledge: false,
      ...config,
    };
  }

  /**
   * Create alert from absorption zone
   */
  createAbsorptionAlert(
    zone: AbsorptionZone,
    coin: Coin
  ): Alert | null {
    if (!this.shouldCreateAlert('absorption_zone')) return null;

    const severity = this.getAbsorptionSeverity(zone);
    if (!this.meetsMinSeverity(severity)) return null;

    const alert: Alert = {
      id: `alert-${zone.id}`,
      coin,
      type: 'absorption_zone',
      severity,
      title: `${zone.side === 'buy' ? 'Buy' : 'Sell'} Absorption Zone Detected`,
      message: `Strong ${zone.side} absorption at $${zone.price.toFixed(2)} with ${zone.volume.toFixed(0)} volume (${zone.tradeCount} trades)`,
      timestamp: zone.timestamp,
      price: zone.price,
      metadata: {
        zoneId: zone.id,
        strength: zone.strength,
        whaleActivity: zone.whaleActivity,
        priceRange: zone.priceRange,
      },
      acknowledged: false,
    };

    if (this.config.autoAcknowledge) {
      alert.expiresAt = Date.now() + (this.config.autoAcknowledgeDelay || 300000);
    }

    this.addAlert(alert);
    return alert;
  }

  /**
   * Create alert from liquidation cascade
   */
  createCascadeAlert(
    cascade: LiquidationCascade,
    coin: Coin
  ): Alert | null {
    if (!this.shouldCreateAlert('liquidation_cascade')) return null;

    const severity = this.getCascadeSeverity(cascade);
    if (!this.meetsMinSeverity(severity)) return null;

    const alert: Alert = {
      id: `alert-${cascade.id}`,
      coin,
      type: 'liquidation_cascade',
      severity,
      title: `${cascade.risk.toUpperCase()} Risk Liquidation Cascade`,
      message: `${cascade.side} liquidation cascade at $${cascade.priceLevel.toFixed(2)} - ${cascade.liquidationCount} liquidations, $${cascade.estimatedVolume.toFixed(0)} at risk`,
      timestamp: cascade.timestamp,
      price: cascade.priceLevel,
      metadata: {
        cascadeId: cascade.id,
        risk: cascade.risk,
        affectedLevels: cascade.affectedLevels,
        triggerPrice: cascade.triggerPrice,
      },
      acknowledged: false,
    };

    if (this.config.autoAcknowledge) {
      alert.expiresAt = Date.now() + (this.config.autoAcknowledgeDelay || 300000);
    }

    this.addAlert(alert);
    return alert;
  }

  /**
   * Create alert from support/resistance level
   */
  createSRAlert(
    level: SupportResistanceLevel,
    coin: Coin,
    eventType: 'touch' | 'breach'
  ): Alert | null {
    const patternType = eventType === 'breach'
      ? (level.type === 'support' ? 'breakdown' : 'breakout')
      : (level.type === 'support' ? 'support_level' : 'resistance_level');

    if (!this.shouldCreateAlert(patternType)) return null;

    const severity = this.getSRSeverity(level, eventType);
    if (!this.meetsMinSeverity(severity)) return null;

    const title = eventType === 'breach'
      ? `${level.type === 'support' ? 'Support' : 'Resistance'} Level Breached`
      : `${level.type === 'support' ? 'Support' : 'Resistance'} Level Test`;

    const message = eventType === 'breach'
      ? `Price broke through ${level.type} at $${level.price.toFixed(2)} (strength: ${level.strength})`
      : `Price testing ${level.type} at $${level.price.toFixed(2)} (${level.touchCount} touches)`;

    const alert: Alert = {
      id: `alert-${level.id}-${eventType}`,
      coin,
      type: patternType,
      severity,
      title,
      message,
      timestamp: eventType === 'breach' && level.breachTimestamp 
        ? level.breachTimestamp 
        : Date.now(),
      price: level.price,
      metadata: {
        levelId: level.id,
        strength: level.strength,
        touchCount: level.touchCount,
        eventType,
      },
      acknowledged: false,
    };

    if (this.config.autoAcknowledge) {
      alert.expiresAt = Date.now() + (this.config.autoAcknowledgeDelay || 300000);
    }

    this.addAlert(alert);
    return alert;
  }

  /**
   * Create alert from detected pattern
   */
  createPatternAlert(
    pattern: DetectedPattern,
    coin: Coin
  ): Alert | null {
    if (!this.shouldCreateAlert(pattern.type)) return null;

    const severity = this.getPatternSeverity(pattern);
    if (!this.meetsMinSeverity(severity)) return null;

    const alert: Alert = {
      id: `alert-${pattern.id}`,
      coin,
      type: pattern.type,
      severity,
      title: pattern.type.split('_').map(w => 
        w.charAt(0).toUpperCase() + w.slice(1)
      ).join(' '),
      message: pattern.description,
      timestamp: pattern.timestamp,
      price: pattern.price,
      metadata: {
        patternId: pattern.id,
        strength: pattern.strength,
        confidence: pattern.confidence,
        ...pattern.metadata,
      },
      acknowledged: false,
    };

    if (this.config.autoAcknowledge) {
      alert.expiresAt = Date.now() + (this.config.autoAcknowledgeDelay || 300000);
    }

    this.addAlert(alert);
    return alert;
  }

  /**
   * Add alert to the manager
   */
  private addAlert(alert: Alert): void {
    this.alerts.set(alert.id, alert);
    this.notifyListeners(alert);
    
    if (this.config.notificationSound) {
      this.playNotificationSound(alert.severity);
    }
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(): Alert[] {
    const now = Date.now();
    return Array.from(this.alerts.values())
      .filter(a => !a.acknowledged && (!a.expiresAt || a.expiresAt > now))
      .sort((a, b) => this.severityToNumber(b.severity) - this.severityToNumber(a.severity));
  }

  /**
   * Get alerts for a specific coin
   */
  getAlertsForCoin(coin: Coin): Alert[] {
    return this.getActiveAlerts().filter(a => a.coin === coin);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    this.alerts.set(alertId, alert);
    return true;
  }

  /**
   * Acknowledge all alerts
   */
  acknowledgeAll(): void {
    this.alerts.forEach(alert => {
      alert.acknowledged = true;
    });
  }

  /**
   * Clear expired alerts
   */
  clearExpiredAlerts(): void {
    const now = Date.now();
    Array.from(this.alerts.entries()).forEach(([id, alert]) => {
      if (alert.expiresAt && alert.expiresAt <= now) {
        this.alerts.delete(id);
      }
    });
  }

  /**
   * Subscribe to new alerts
   */
  subscribe(listener: (alert: Alert) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AlertConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): AlertConfig {
    return { ...this.config };
  }

  /**
   * Helper: Check if should create alert for pattern type
   */
  private shouldCreateAlert(type: PatternType): boolean {
    return this.config.enabled && this.config.patterns.includes(type);
  }

  /**
   * Helper: Check if severity meets minimum
   */
  private meetsMinSeverity(severity: AlertSeverity): boolean {
    const severityLevels: AlertSeverity[] = ['info', 'low', 'medium', 'high', 'critical'];
    const minIndex = severityLevels.indexOf(this.config.minSeverity);
    const alertIndex = severityLevels.indexOf(severity);
    return alertIndex >= minIndex;
  }

  /**
   * Helper: Get absorption zone severity
   */
  private getAbsorptionSeverity(zone: AbsorptionZone): AlertSeverity {
    if (zone.whaleActivity && zone.strength >= 80) return 'critical';
    if (zone.strength >= 70) return 'high';
    if (zone.strength >= 50) return 'medium';
    if (zone.strength >= 30) return 'low';
    return 'info';
  }

  /**
   * Helper: Get cascade severity
   */
  private getCascadeSeverity(cascade: LiquidationCascade): AlertSeverity {
    if (cascade.risk === 'high') return 'critical';
    if (cascade.risk === 'medium') return 'high';
    return 'medium';
  }

  /**
   * Helper: Get S/R level severity
   */
  private getSRSeverity(
    level: SupportResistanceLevel,
    eventType: 'touch' | 'breach'
  ): AlertSeverity {
    if (eventType === 'breach') {
      if (level.strength >= 70) return 'critical';
      if (level.strength >= 50) return 'high';
      return 'medium';
    }
    
    if (level.strength >= 70) return 'high';
    if (level.strength >= 50) return 'medium';
    return 'low';
  }

  /**
   * Helper: Get pattern severity
   */
  private getPatternSeverity(pattern: DetectedPattern): AlertSeverity {
    const strength = pattern.strength * pattern.confidence;
    if (strength >= 80) return 'critical';
    if (strength >= 60) return 'high';
    if (strength >= 40) return 'medium';
    if (strength >= 20) return 'low';
    return 'info';
  }

  /**
   * Helper: Convert severity to number for sorting
   */
  private severityToNumber(severity: AlertSeverity): number {
    const levels = { critical: 5, high: 4, medium: 3, low: 2, info: 1 };
    return levels[severity];
  }

  /**
   * Helper: Play notification sound (browser API)
   */
  private playNotificationSound(severity: AlertSeverity): void {
    if (typeof window === 'undefined') return;
    
    // Different frequencies for different severities
    const frequencies = {
      critical: [880, 1046],
      high: [659, 783],
      medium: [523, 659],
      low: [440, 523],
      info: [349, 440],
    };

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const [freq1, freq2] = frequencies[severity];
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq1;
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
      
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        
        osc2.frequency.value = freq2;
        gain2.gain.setValueAtTime(0.1, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.1);
      }, 150);
    } catch (error) {
      console.warn('[AlertManager] Failed to play notification sound:', error);
    }
  }

  /**
   * Helper: Notify all listeners
   */
  private notifyListeners(alert: Alert): void {
    this.listeners.forEach(listener => {
      try {
        listener(alert);
      } catch (error) {
        console.error('[AlertManager] Listener error:', error);
      }
    });
  }
}

// Singleton instance
let alertManagerInstance: AlertManager | null = null;

/**
 * Get the global alert manager instance
 */
export function getAlertManager(config?: Partial<AlertConfig>): AlertManager {
  if (!alertManagerInstance) {
    alertManagerInstance = new AlertManager(config);
  }
  return alertManagerInstance;
}

/**
 * Reset the alert manager (mainly for testing)
 */
export function resetAlertManager(): void {
  alertManagerInstance = null;
}
