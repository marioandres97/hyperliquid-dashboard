'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, TrendingUp, Bell, DollarSign } from 'lucide-react';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/orders', icon: TrendingUp, label: 'Orders' },
  { href: '/alerts', icon: Bell, label: 'Alerts' },
  { href: '/pnl', icon: DollarSign, label: 'PnL' },
];

export default function BottomNav() {
  const pathname = usePathname();
  
  // Hide bottom nav on landing page
  if (pathname === '/') {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-gray-900/30 border-t border-emerald-500/10">
      <div 
        className="flex items-center justify-around h-16"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-1 flex-1 touch-target transition-all duration-300"
            >
              <Icon
                className={`w-5 h-5 transition-colors duration-300 ${
                  isActive ? 'text-emerald-500' : 'text-gray-400'
                }`}
              />
              <span
                className={`text-xs font-medium transition-colors duration-300 ${
                  isActive ? 'text-emerald-500' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-emerald-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
