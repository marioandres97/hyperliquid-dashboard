import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FeedItem {
  id: string | number;
  timestamp: Date;
  content: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning';
}

interface RealTimeFeedProps {
  items: FeedItem[];
  maxItems?: number;
  className?: string;
  autoScroll?: boolean;
  showTimestamps?: boolean;
}

export const RealTimeFeed: React.FC<RealTimeFeedProps> = ({
  items,
  maxItems = 50,
  className = '',
  autoScroll = true,
  showTimestamps = true,
}) => {
  const feedRef = useRef<HTMLDivElement>(null);
  const prevItemsLength = useRef(items.length);

  useEffect(() => {
    if (autoScroll && feedRef.current && items.length > prevItemsLength.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
    prevItemsLength.current = items.length;
  }, [items, autoScroll]);

  const displayItems = items.slice(-maxItems);

  const getVariantStyles = (variant?: string) => {
    switch (variant) {
      case 'success':
        return {
          background: 'rgba(16, 185, 129, 0.1)',
          borderColor: 'rgba(16, 185, 129, 0.3)',
        };
      case 'danger':
        return {
          background: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
        };
      case 'warning':
        return {
          background: 'rgba(245, 158, 11, 0.1)',
          borderColor: 'rgba(245, 158, 11, 0.3)',
        };
      default:
        return {
          background: 'rgba(59, 130, 246, 0.05)',
          borderColor: 'rgba(59, 130, 246, 0.2)',
        };
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <div
      ref={feedRef}
      className={`overflow-y-auto space-y-2 ${className}`}
      style={{ maxHeight: '600px' }}
    >
      <AnimatePresence initial={false}>
        {displayItems.map((item) => {
          const styles = getVariantStyles(item.variant);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-lg border p-3"
              style={{
                ...styles,
                backdropFilter: 'blur(8px)',
              }}
            >
              <div className="flex items-start gap-3">
                {showTimestamps && (
                  <span className="text-xs font-mono text-gray-400 whitespace-nowrap">
                    {formatTime(item.timestamp)}
                  </span>
                )}
                <div className="flex-1 text-sm">{item.content}</div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default RealTimeFeed;
