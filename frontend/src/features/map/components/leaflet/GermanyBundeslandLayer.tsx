import { memo, useMemo, useRef, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import type { Layer } from 'leaflet';
import type { Feature, Geometry } from 'geojson';
import { germanyBundeslandGeoJson } from '../../data/germany/bundeslandGeoJson';
import { getBundeslandGeoStyles, useMapThemeRevision } from '../../utils/mapThemeUtils';

interface GermanyBundeslandLayerProps {
  active: boolean;
  selectedBundeslandId?: string;
  onSelect?: (bundeslandId: string) => void;
  onHover?: (bundeslandId: string | null) => void;
}

export const GermanyBundeslandLayer = memo(function GermanyBundeslandLayer({
  active,
  selectedBundeslandId,
  onSelect,
  onHover,
}: GermanyBundeslandLayerProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const themeRev = useMapThemeRevision();
  const geoStyles = useMemo(() => getBundeslandGeoStyles(), [themeRev]);
  const stylesRef = useRef(geoStyles);
  stylesRef.current = geoStyles;

  const style = useMemo(
    () => (feature?: Feature<Geometry>) => {
      const s = stylesRef.current;
      const id = feature?.properties?.id as string | undefined;
      if (!id) return s.base;
      if (selectedBundeslandId && id === selectedBundeslandId) return s.selected;
      if (hovered && id === hovered) return s.hover;
      if (selectedBundeslandId && id !== selectedBundeslandId) return s.dim;
      return s.base;
    },
    [selectedBundeslandId, hovered, themeRev],
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
      key={`de-bl-${selectedBundeslandId ?? 'all'}-${themeRev}`}
      data={germanyBundeslandGeoJson}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
});
