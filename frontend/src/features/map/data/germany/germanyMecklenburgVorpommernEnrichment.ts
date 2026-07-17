import type { MapCityMetrics } from '@shared/types';
import type { GermanyInfrastructure } from '../../types/germanyTypes';

type MetricsSlice = Pick<
  MapCityMetrics,
  'companies' | 'jobs' | 'warehouses' | 'transport' | 'marketplace' | 'aiScore'
>;

export interface MecklenburgVorpommernEnrichment {
  metrics: MetricsSlice;
  logisticsScore?: number;
  tourismScore?: number;
  infra?: Partial<GermanyInfrastructure>;
}

export const GERMANY_MV_ENRICHMENT: Record<string, MecklenburgVorpommernEnrichment> = {
  // ── Mecklenburg-Vorpommern OSM import (pending batch 1) ──
};
