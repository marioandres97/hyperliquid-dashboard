'use client';

import { getChannelIcon, getChannelName } from '@/types/alerts';
import type { NotificationChannel } from '@/types/alerts';

interface ChannelBadgeProps {
  channel: NotificationChannel;
  size?: 'sm' | 'md';
}

const channelColors: Record<NotificationChannel, string> = {
  push: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
  email: 'bg-purple-500/20 border-purple-500/40 text-purple-400',
  telegram: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400',
  whatsapp: 'bg-green-500/20 border-green-500/40 text-green-400',
};

export function ChannelBadge({ channel, size = 'md' }: ChannelBadgeProps) {
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${channelColors[channel]} ${sizeClasses}`}
    >
      <span>{getChannelIcon(channel)}</span>
      <span>{getChannelName(channel)}</span>
    </span>
  );
}
