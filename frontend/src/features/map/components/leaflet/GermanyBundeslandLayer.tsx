import { memo, useMemo, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import type { Layer, PathOptions } from 'leaflet';
import type { Feature, Geometry } from 'geojson';
import { germanyBundeslandGeoJson } from '../../data/germany/bundeslandGeoJson';

interface GermanyBundeslandLayerProps {
  active: boolean;
  selectedBundeslandId?: string;
  onSelect?: (bundeslandId: string) => void;
  onHover?: (bundeslandId: string | null) => void;
}

const BASE: PathOptions = {
  fillColor: '#243d5c',
  fillOpacity: 0.26,
  color: '#52c4f0',
  weight: 1.1,
  opacity: 0.62,
};

const HOVER: PathOptions = {
  fillColor: '#2d5490',
  fillOpacity: 0.38,
  color: '#8dd8fc',
  weight: 1.65,
  opacity: 0.9,
};

const SELECTED: PathOptions = {
  fillColor: '#3d4f63',
  fillOpacity: 0.5,
  color: '#fbbf24',
  weight: 2.2,
  opacity: 1,
};

const DIM: PathOptions = {
  fillColor: '#141e2e',
  fillOpacity: 0.14,
  color: '#2d4a68',
  weight: 0.7,
  opacity: 0.32,
};

export const GermanyBundeslandLayer = memo(function GermanyBundeslandLayer({
  active,
  selectedBundeslandId,
  onSelect,
  onHover,
}: GermanyBundeslandLayerProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const style = useMemo(
    () => (feature?: Feature<Geometry>) => {
      const id = feature?.properties?.id as string | undefined;
      if (!id) return BASE;
      if (selectedBundeslandId && id === selectedBundeslandId) return SELECTED;
      if (hovered && id === hovered) return HOVER;
      if (selectedBundeslandId && id !== selectedBundeslandId) return DIM;
      return BASE;
    },
    [selectedBundeslandId, hovered],
  );

  if (!active) return null;

  const onEachFeature = (feature: Feature<Geometry>, layer: Layer) => {
    const id = feature.properties?.id as string;
    const name = (feature.properties?.name as string) ?? id;

    layer.bindTooltip(name, {
      sticky: true,
      className: 'ebh-country-tooltip',
    });

    layer.on({
      mouseover: () => {
        setHovered(id);
        onHover?.(id);
      },
      mouseout: () => {
        setHovered(null);
        onHover?.(null);
      },
      click: () => onSelect?.(id),
    });
  };

  return (
    <GeoJSON
      key={`de-bl-${selectedBundeslandId ?? 'all'}`}
      data={germanyBundeslandGeoJson}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
});
