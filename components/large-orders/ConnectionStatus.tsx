'use client';

import { motion } from 'framer-motion';
import type { ConnectionState } from '@/types/large-orders';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface ConnectionStatusProps {
  connectionState: ConnectionState;
  onReconnect?: () => void;
}

export function ConnectionStatus({ connectionState, onReconnect }: ConnectionStatusProps) {
  const getStatusColor = () => {
    switch (connectionState.quality) {
      case 'excellent':
        return { bg: 'bg-green-500', text: 'text-green-400', label: 'Excellent' };
      case 'good':
        return { bg: 'bg-yellow-500', text: 'text-yellow-400', label: 'Good' };
      case 'poor':
        return { bg: 'bg-orange-500', text: 'text-orange-400', label: 'Poor' };
      case 'disconnected':
      default:
        return { bg: 'bg-red-500', text: 'text-red-400', label: 'Disconnected' };
    }
  };

  const status = getStatusColor();
  const isConnected = connectionState.connected;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Wifi className={`w-4 h-4 ${status.text}`} />
        ) : (
          <WifiOff className="w-4 h-4 text-red-400" />
        )}
        <div className="flex items-center gap-2">
          <div className="relative w-2 h-2">
            <motion.div
              className={`absolute inset-0 rounded-full ${status.bg}`}
              animate={isConnected ? { scale: [1, 1.5, 1], opacity: [1, 0, 1] } : {}}
              transition={isConnected ? { duration: 2, repeat: Infinity } : {}}
            />
            <div className={`absolute inset-0 rounded-full ${status.bg}`} />
          </div>
          <span className={`text-xs font-mono font-semibold ${status.text}`}>
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>
      
      {!isConnected && onReconnect && (
        <motion.button
          onClick={onReconnect}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-400">Reconnect</span>
        </motion.button>
      )}
    </div>
  );
}
