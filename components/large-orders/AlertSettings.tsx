'use client';

import { Bell, Volume2, VolumeX, BellOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface AlertSettingsProps {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  onSoundToggle: () => void;
  onNotificationsToggle: () => void;
}

export function AlertSettings({
  soundEnabled,
  notificationsEnabled,
  onSoundToggle,
  onNotificationsToggle,
}: AlertSettingsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Sound Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSoundToggle}
        className={`p-2 rounded-xl transition-all duration-200 ${
          soundEnabled
            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
            : 'bg-white/5 text-gray-500 hover:bg-white/10'
        }`}
        title={soundEnabled ? 'Sound alerts enabled' : 'Sound alerts disabled'}
      >
        {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </motion.button>

      {/* Notifications Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNotificationsToggle}
        className={`p-2 rounded-xl transition-all duration-200 ${
          notificationsEnabled
            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
            : 'bg-white/5 text-gray-500 hover:bg-white/10'
        }`}
        title={notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled'}
      >
        {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
      </motion.button>
    </div>
  );
}
