// Configuración central de widgets

export interface WidgetConfig {
  id: string;
  title: string;
  enabled: boolean;
  gridSize: {
    cols: number;
    rows: number;
  };
}

export const widgetsConfig = [
  {
    id: 'price-funding-correlation',
    title: 'Price vs Funding Rate Correlation',
    enabled: true,
    gridSize: { cols: 2, rows: 1 }
  },
  // Añade esto:
  {
    id: 'order-flow',
    title: 'Order Flow Analysis',
    enabled: true,
    gridSize: { cols: 2, rows: 1 }
  }
];

export const enabledWidgets = widgetsConfig.filter((w) => w.enabled);