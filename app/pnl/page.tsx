import Header from '@/components/Header';
import MarketHoursBar from '@/components/MarketHoursBar';
import { PnLTrackerWidgetWithBackground } from '@/widgets/pnl-tracker/PnLTrackerWidget';

export default function PnLPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <MarketHoursBar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 
          className="text-4xl font-bold mb-8"
          style={{ 
            color: 'var(--venom-green-primary)',
            fontFamily: 'var(--apple-font-system)',
            letterSpacing: 'var(--apple-letter-spacing)',
          }}
        >
          PnL Tracker
        </h1>
        
        <PnLTrackerWidgetWithBackground />
      </div>
    </div>
  );
}
