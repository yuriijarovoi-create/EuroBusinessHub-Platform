import type { MapEngineAction, MapEngineState, BusinessFilterState } from './types';
import { DEFAULT_LAYER_STATE } from '../types/mapTypes';
import { EUROPE_CENTER, EUROPE_DEFAULT_ZOOM } from '../config/leafletConfig';

export const DEFAULT_BUSINESS_FILTERS: BusinessFilterState = {
  ...DEFAULT_LAYER_STATE,
  marketplace: true,
  transport: true,
  partners: true,
  academy: true,
  digitalProducts: true,
  ai: true,
  events: true,
  investments: true,
  startups: true,
  manufacturing: true,
  agriculture: true,
  construction: true,
  medical: true,
  tourism: true,
  technology: true,
  finance: true,
  legal: true,
  education: true,
  businessServices: true,
};

export function createInitialMapEngineState(provider: MapEngineState['provider'] = 'leaflet'): MapEngineState {
  return {
    provider,
    viewport: {
      center: { lat: EUROPE_CENTER[0], lng: EUROPE_CENTER[1] },
      zoom: EUROPE_DEFAULT_ZOOM,
    },
    navigation: {
      level: 'europe',
      countryCode: null,
      regionId: null,
      cityId: null,
      transitioning: false,
    },
    layers: { ...DEFAULT_LAYER_STATE },
    businessFilters: { ...DEFAULT_BUSINESS_FILTERS },
    selectedCity: null,
    selectedCountry: null,
    selectedRoute: null,
    flyTargetCityId: null,
    routes: [],
    cities: [],
    liveStats: {
      activeUsers: 12840,
      openJobs: 3420,
      marketplaceOffers: 8910,
      transportOffers: 1240,
      warehouses: 680,
    },
  };
}

export function mapEngineReducer(state: MapEngineState, action: MapEngineAction): MapEngineState {
  switch (action.type) {
    case 'SET_PROVIDER':
      return { ...state, provider: action.provider };
    case 'SET_VIEWPORT':
      return { ...state, viewport: { ...state.viewport, ...action.viewport } };
    case 'NAVIGATE':
      return {
        ...state,
        navigation: { ...state.navigation, ...action.navigation },
      };
    case 'SET_LAYERS':
      return { ...state, layers: action.layers };
    case 'SET_BUSINESS_FILTERS':
      return {
        ...state,
        businessFilters: { ...state.businessFilters, ...action.filters },
      };
    case 'SELECT_CITY':
      return {
        ...state,
        selectedCity: action.city,
        flyTargetCityId: action.fly ? action.city?.id ?? null : state.flyTargetCityId,
        navigation: {
          ...state.navigation,
          level: action.city ? 'city' : state.navigation.level,
          cityId: action.city?.id ?? null,
          countryCode: action.city?.countryCode ?? state.navigation.countryCode,
        },
      };
    case 'SELECT_COUNTRY':
      return {
        ...state,
        selectedCountry: action.country,
        navigation: {
          ...state.navigation,
          level: action.country ? 'country' : 'europe',
          countryCode: action.country?.code ?? null,
          cityId: null,
          regionId: null,
        },
      };
    case 'SELECT_ROUTE':
      return { ...state, selectedRoute: action.route };
    case 'SET_ROUTES':
      return { ...state, routes: action.routes };
    case 'SET_CITIES':
      return { ...state, cities: action.cities };
    case 'CLEAR_FLY_TARGET':
      return { ...state, flyTargetCityId: null };
    case 'RESET_EUROPE':
      return {
        ...state,
        selectedCity: null,
        selectedCountry: null,
        selectedRoute: null,
        flyTargetCityId: null,
        navigation: {
          level: 'europe',
          countryCode: null,
          regionId: null,
          cityId: null,
          transitioning: false,
        },
      };
    default:
      return state;
  }
}
