import type { BusinessRouteDef } from '../types/mapTypes';
import { LOGISTICS_NETWORK_ROUTES } from './logisticsHubNetwork';

/**
 * Premium European logistics network — hub-centric backbone.
 * All routes grow from primary/secondary logistics hubs (see logisticsHubNetwork.ts).
 */
export const BUSINESS_CORRIDORS: BusinessRouteDef[] = LOGISTICS_NETWORK_ROUTES;
