import type { FeatureCollection } from 'geojson';
import { BUNDESLAENDER } from './bundeslandData';

export const germanyBundeslandGeoJson: FeatureCollection = {
  type: 'FeatureCollection',
  features: BUNDESLAENDER.map((bl) => ({
    type: 'Feature',
    properties: {
      id: bl.id,
      name: bl.name,
      nameEn: bl.nameEn,
      ISO_A2: 'DE',
    },
    geometry: {
      type: 'Polygon',
      coordinates: [bl.ring.map(([lat, lng]) => [lng, lat])],
    },
  })),
};
