import { Activity, Users, Ship, AlertCircle, MapPin, BarChart3, Book } from 'lucide-react';
import { SignalConfirmation } from '../types';

interface SignalConfirmationsProps {
  confirmations: SignalConfirmation[];
}

const CONFIRMATION_ICONS: Record<string, any> = {
  cvd_divergence: Activity,
  aggressive_imbalance: Users,
  large_order: Ship,
  no_liquidations: AlertCircle,
  hvn_lvn: BarChart3,
  wall_broken: MapPin,
  orderbook_imbalance: Book,
};

export function SignalConfirmations({ confirmations }: SignalConfirmationsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {confirmations.map((conf, idx) => {
        const Icon = CONFIRMATION_ICONS[conf.type] || Activity;
        
        return (
          <div
            key={idx}
            className="bg-white/5 rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs truncate">{conf.description}</div>
                {conf.value && (
                  <div className="text-xs font-semibold text-cyan-400 mt-0.5">
                    {conf.value}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}