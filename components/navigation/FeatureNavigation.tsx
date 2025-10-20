'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, TrendingUp, Bell, DollarSign } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/orders', label: 'Orders', icon: TrendingUp },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/pnl', label: 'PnL', icon: DollarSign },
];

export default function FeatureNavigation() {
  const pathname = usePathname();
  
  return (
    <nav className="flex gap-2 mb-12 border-b border-emerald-500/10 pb-4 overflow-x-auto">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
              ${isActive 
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                : 'text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/5'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium whitespace-nowrap">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
