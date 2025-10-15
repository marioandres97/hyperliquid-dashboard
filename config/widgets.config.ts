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

export const widgetsConfig: WidgetConfig[] = [
  {
    id: 'oi-price-correlation',
    title: 'OI vs Price Correlation',
    enabled: true,
    gridSize: {
      cols: 2,
      rows: 1,
    },
  },
  // Aquí añadirás más widgets en el futuro
];

export const enabledWidgets = widgetsConfig.filter((w) => w.enabled);