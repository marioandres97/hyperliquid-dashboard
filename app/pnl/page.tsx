import { PnLTrackerWidgetWithBackground } from '@/widgets/pnl-tracker/PnLTrackerWidget';
import Header from '@/components/Header';
import MarketHoursBar from '@/components/MarketHoursBar';

export default function PnLPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <MarketHoursBar />
      
      <div className="container mx-auto px-4 py-8">
        <PnLTrackerWidgetWithBackground />
      </div>
    </div>
  );
}
