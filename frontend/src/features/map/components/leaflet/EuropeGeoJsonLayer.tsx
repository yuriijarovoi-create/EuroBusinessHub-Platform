import { memo, useMemo, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import type { Layer, PathOptions } from 'leaflet';
import type { Feature, Geometry } from 'geojson';
import { europeCountriesGeoJson } from '../../data/europeCountriesGeoJson';

interface EuropeGeoJsonLayerProps {
  selectedCountryCode?: string;
  hoveredCountryCode?: string;
  onCountrySelect?: (isoCode: string) => void;
  onCountryHover?: (isoCode: string | null) => void;
}

const BASE_STYLE: PathOptions = {
  fillColor: '#1c2d45',
  fillOpacity: 0.56,
  color: '#5da8d8',
  weight: 1,
  opacity: 0.72,
};

const COAST_STYLE: PathOptions = {
  ...BASE_STYLE,
  weight: 1.15,
  opacity: 0.8,
};

const HOVER_STYLE: PathOptions = {
  fillColor: '#243f62',
  fillOpacity: 0.72,
  color: '#8dd8fc',
  weight: 1.5,
  opacity: 0.95,
};

const SELECTED_STYLE: PathOptions = {
  fillColor: '#3d4f63',
  fillOpacity: 0.82,
  weight: 2,
  color: '#fbbf24',
  opacity: 1,
};

const DIM_STYLE: PathOptions = {
  fillColor: '#121c2a',
  fillOpacity: 0.38,
  color: '#2d4a68',
  weight: 0.65,
  opacity: 0.38,
};

export const EuropeGeoJsonLayer = memo(function EuropeGeoJsonLayer({
  selectedCountryCode,
  hoveredCountryCode,
  onCountrySelect,
  onCountryHover,
}: EuropeGeoJsonLayerProps) {
  const data = europeCountriesGeoJson;
  const [hovered, setHovered] = useState<string | null>(null);
  const activeHover = hoveredCountryCode ?? hovered;

  const style = useMemo(
    () => (feature?: Feature<Geometry>) => {
      const iso = feature?.properties?.ISO_A2 as string | undefined;
      if (!iso) return BASE_STYLE;
      if (selectedCountryCode && iso === selectedCountryCode) {
        return iso === 'DE'
          ? { ...SELECTED_STYLE, weight: 2.6, color: '#fbbf24', fillOpacity: 0.68 }
          : SELECTED_STYLE;
      }
      if (activeHover && iso === activeHover) return HOVER_STYLE;
      if (selectedCountryCode && iso !== selectedCountryCode) return DIM_STYLE;
      return COAST_STYLE;
    },
    [selectedCountryCode, activeHover],
  );

  const onEachFeature = (feature: Feature<Geometry>, layer: Layer) => {
    const iso = feature.properties?.ISO_A2 as string | undefined;
    const name = (feature.properties?.NAME as string) ?? iso ?? '';

    layer.bindTooltip(name, {
      sticky: true,
      className: 'ebh-country-tooltip',
      direction: 'center',
      opacity: 0.92,
    });

    layer.on({
      mouseover: (e) => {
        const path = e.target;
        if (iso && iso !== selectedCountryCode) {
          path.setStyle(HOVER_STYLE);
          setHovered(iso);
          onCountryHover?.(iso);
        }
      },
      mouseout: (e) => {
        const path = e.target;
        if (!iso) return;
        setHovered(null);
        onCountryHover?.(null);
        if (iso === selectedCountryCode) {
          path.setStyle(SELECTED_STYLE);
        } else if (selectedCountryCode) {
          path.setStyle(DIM_STYLE);
        } else {
          path.setStyle(COAST_STYLE);
        }
      },
      click: () => {
        if (iso) onCountrySelect?.(iso);
      },
    });
  };

  return (
    <GeoJSON
      key={`${selectedCountryCode ?? 'all'}-${activeHover ?? 'none'}`}
      data={data}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
});
