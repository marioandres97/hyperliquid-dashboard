import Header from '@/components/Header';
import MarketHoursBar from '@/components/MarketHoursBar';
import { EconomicCalendar } from '@/components/economic-calendar/EconomicCalendar';
import WidgetContainer from '@/components/layout/WidgetContainer';
import EconomicCalendarBackground from '@/components/layout/backgrounds/EconomicCalendarBackground';

export default function CalendarPage() {
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
          Economic Calendar
        </h1>
        
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
