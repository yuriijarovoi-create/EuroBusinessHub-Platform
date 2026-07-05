/** Lat/lng → SVG viewBox (0 0 100 70) projection for Europe */

const EUROPE_BOUNDS = {
  minLat: 35,
  maxLat: 72,
  minLng: -12,
  maxLng: 42,
};

export function latLngToMapXY(lat: number, lng: number): { mapX: number; mapY: number } {
  const mapX =
    ((lng - EUROPE_BOUNDS.minLng) / (EUROPE_BOUNDS.maxLng - EUROPE_BOUNDS.minLng)) * 100;
  const mapY =
    ((EUROPE_BOUNDS.maxLat - lat) / (EUROPE_BOUNDS.maxLat - EUROPE_BOUNDS.minLat)) * 70;
  return {
    mapX: Math.round(mapX * 100) / 100,
    mapY: Math.round(mapY * 100) / 100,
  };
}

/** Build closed SVG path from geographic coordinates */
export function coordsToSvgPath(coords: [lat: number, lng: number][]): string {
  return (
    coords
      .map(([lat, lng], i) => {
        const { mapX, mapY } = latLngToMapXY(lat, lng);
        return `${i === 0 ? 'M' : 'L'} ${mapX.toFixed(2)} ${mapY.toFixed(2)}`;
      })
      .join(' ') + ' Z'
  );
}

export function getCountryViewport(country: {
  centerX: number;
  centerY: number;
  zoomLevel: number;
}): { translateX: number; translateY: number; scale: number } {
  const scale = country.zoomLevel;
  const translateX = 50 - country.centerX * scale;
  const translateY = 35 - country.centerY * scale;
  return { translateX, translateY, scale };
}

export const EUROPE_DEFAULT_VIEWPORT = { scale: 1, translateX: 0, translateY: 0 };

export const VIEWPORT_LIMITS = {
  minScale: 0.85,
  maxScale: 6,
};
