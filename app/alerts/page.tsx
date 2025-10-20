import Header from '@/components/Header';
import MarketHoursBar from '@/components/MarketHoursBar';
import { AlertSystem } from '@/components/alerts/AlertSystem';
import WidgetContainer from '@/components/layout/WidgetContainer';
import AlertBackground from '@/components/layout/backgrounds/AlertBackground';

export default function AlertsPage() {
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
          Alert System
        </h1>
        
        <WidgetContainer 
          title=""
          background={<AlertBackground />}
        >
          <AlertSystem />
        </WidgetContainer>
      </div>
    </div>
  );
}
