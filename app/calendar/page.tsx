import { EconomicCalendar } from '@/components/economic-calendar/EconomicCalendar';
import WidgetContainer from '@/components/layout/WidgetContainer';
import EconomicCalendarBackground from '@/components/layout/backgrounds/EconomicCalendarBackground';
import Header from '@/components/Header';
import MarketHoursBar from '@/components/MarketHoursBar';

export default function CalendarPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <MarketHoursBar />
      
      <div className="container mx-auto px-4 py-8">
        <WidgetContainer 
          title=""
          background={<EconomicCalendarBackground />}
        >
          <EconomicCalendar />
        </WidgetContainer>
      </div>
    </div>
  );
}
