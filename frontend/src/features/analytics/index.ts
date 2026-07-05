/** Analytics feature — prepared for dashboards & reporting */
export interface AnalyticsMetric {
  key: string;
  label: string;
  value: number;
  change: number;
}

export const mockMetrics: AnalyticsMetric[] = [];
