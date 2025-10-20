'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff } from 'lucide-react';
import {
  isSubscribedToEvent,
  subscribeToEvent,
  unsubscribeFromEvent,
  requestNotificationPermission,
  getNotificationPermission,
} from '@/lib/economic-calendar/notifications';

interface NotificationBellProps {
  eventId: string;
  onSubscriptionChange?: (subscribed: boolean) => void;
}

export function NotificationBell({ eventId, onSubscriptionChange }: NotificationBellProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    setIsSubscribed(isSubscribedToEvent(eventId));
    setPermission(getNotificationPermission());
  }, [eventId]);

  const handleToggle = async () => {
    // If not subscribed and permission not granted, request it
    if (!isSubscribed && permission !== 'granted') {
      const newPermission = await requestNotificationPermission();
      setPermission(newPermission);
      
      if (newPermission !== 'granted') {
        return; // Don't subscribe if permission denied
      }
    }

    const newSubscribed = !isSubscribed;
    
    if (newSubscribed) {
      subscribeToEvent(eventId);
    } else {
      unsubscribeFromEvent(eventId);
    }
    
    setIsSubscribed(newSubscribed);
    onSubscriptionChange?.(newSubscribed);
  };

  return (
    <motion.button
      onClick={handleToggle}
      className={`relative p-2 rounded-lg transition-all duration-300 ${
        isSubscribed
          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70'
      }`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={isSubscribed ? 'Unsubscribe from notifications' : 'Subscribe to notifications'}
    >
      {isSubscribed ? (
        <Bell className="w-5 h-5" fill="currentColor" />
      ) : (
        <BellOff className="w-5 h-5" />
      )}
      
      {isSubscribed && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full"
        />
      )}
    </motion.button>
  );
}
