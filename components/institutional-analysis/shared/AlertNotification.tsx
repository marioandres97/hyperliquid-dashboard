import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X, TrendingUp } from 'lucide-react';

export type AlertType = 'info' | 'success' | 'warning' | 'error' | 'trade';

export interface Alert {
  id: string | number;
  type: AlertType;
  title: string;
  message: string;
  timestamp?: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AlertNotificationProps {
  alerts: Alert[];
  onDismiss: (id: string | number) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxAlerts?: number;
}

export const AlertNotification: React.FC<AlertNotificationProps> = ({
  alerts,
  onDismiss,
  position = 'top-right',
  maxAlerts = 5,
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  const getAlertConfig = (type: AlertType) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bg: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.4)',
          iconColor: '#10B981',
        };
      case 'error':
        return {
          icon: AlertCircle,
          bg: 'rgba(239, 68, 68, 0.15)',
          border: 'rgba(239, 68, 68, 0.4)',
          iconColor: '#EF4444',
        };
      case 'warning':
        return {
          icon: AlertCircle,
          bg: 'rgba(245, 158, 11, 0.15)',
          border: 'rgba(245, 158, 11, 0.4)',
          iconColor: '#F59E0B',
        };
      case 'trade':
        return {
          icon: TrendingUp,
          bg: 'rgba(139, 92, 246, 0.15)',
          border: 'rgba(139, 92, 246, 0.4)',
          iconColor: '#8B5CF6',
        };
      default:
        return {
          icon: Info,
          bg: 'rgba(59, 130, 246, 0.15)',
          border: 'rgba(59, 130, 246, 0.4)',
          iconColor: '#3B82F6',
        };
    }
  };

  const displayAlerts = alerts.slice(-maxAlerts);

  return (
    <div className={`fixed ${positionClasses[position]} z-50 space-y-2 w-96 max-w-full`}>
      <AnimatePresence>
        {displayAlerts.map((alert) => {
          const config = getAlertConfig(alert.type);
          const Icon = config.icon;

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: position.includes('right') ? 50 : -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="rounded-xl p-4 shadow-2xl"
              style={{
                background: config.bg,
                border: `1px solid ${config.border}`,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              <div className="flex items-start gap-3">
                <Icon
                  className="flex-shrink-0 mt-0.5"
                  size={20}
                  style={{ color: config.iconColor }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm text-white">{alert.title}</h4>
                    <button
                      onClick={() => onDismiss(alert.id)}
                      className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{alert.message}</p>
                  {alert.timestamp && (
                    <p className="text-xs text-gray-400 mt-1 font-mono">
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                  )}
                  {alert.action && (
                    <button
                      onClick={alert.action.onClick}
                      className="mt-2 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: config.iconColor }}
                    >
                      {alert.action.label} →
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default AlertNotification;
