export default function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Venomouz Insightz',
    description: 'Elite Trading Terminal for Premium Traders - Real-time market intelligence, institutional-grade analytics, and precision trading tools',
    url: 'https://venomouz-insightz.com',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      name: 'Venomouz Insightz',
    },
    featureList: [
      'Real-time market prices',
      'Economic calendar',
      'Large orders feed',
      'Alert system',
      'PnL tracker',
      'Institutional-grade analytics',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
