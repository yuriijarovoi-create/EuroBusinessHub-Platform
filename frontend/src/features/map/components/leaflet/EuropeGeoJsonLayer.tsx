import { memo, useMemo, useRef, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import type { Layer } from 'leaflet';
import type { Feature, Geometry } from 'geojson';
import { europeCountriesGeoJson } from '../../data/europeCountriesGeoJson';
import {
  getEuropeCountryGeoStyles,
  useMapThemeRevision,
} from '../../utils/mapThemeUtils';

interface EuropeGeoJsonLayerProps {
  selectedCountryCode?: string;
  hoveredCountryCode?: string;
  onCountrySelect?: (isoCode: string) => void;
  onCountryHover?: (isoCode: string | null) => void;
}

export const EuropeGeoJsonLayer = memo(function EuropeGeoJsonLayer({
  selectedCountryCode,
  hoveredCountryCode,
  onCountrySelect,
  onCountryHover,
}: EuropeGeoJsonLayerProps) {
  const data = europeCountriesGeoJson;
  const [hovered, setHovered] = useState<string | null>(null);
  const activeHover = hoveredCountryCode ?? hovered;
  const themeRev = useMapThemeRevision();
  const geoStyles = useMemo(() => getEuropeCountryGeoStyles(), [themeRev]);
  const stylesRef = useRef(geoStyles);
  stylesRef.current = geoStyles;

  const style = useMemo(
    () => (feature?: Feature<Geometry>) => {
      const s = stylesRef.current;
      const iso = feature?.properties?.ISO_A2 as string | undefined;
      if (!iso) return s.base;
      if (selectedCountryCode && iso === selectedCountryCode) {
        return iso === 'DE' ? s.selectedDe : s.selected;
      }
      if (activeHover && iso === activeHover) return s.hover;
      if (selectedCountryCode && iso !== selectedCountryCode) return s.dim;
      return s.coast;
    },
    [selectedCountryCode, activeHover, themeRev],
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
          path.setStyle(stylesRef.current.hover);
          setHovered(iso);
          onCountryHover?.(iso);
        }
      },
      mouseout: (e) => {
        const path = e.target;
        if (!iso) return;
        setHovered(null);
        onCountryHover?.(null);
        const s = stylesRef.current;
        if (iso === selectedCountryCode) {
          path.setStyle(iso === 'DE' ? s.selectedDe : s.selected);
        } else if (selectedCountryCode) {
          path.setStyle(s.dim);
        } else {
          path.setStyle(s.coast);
        }
      },
      click: () => {
        if (iso) onCountrySelect?.(iso);
      },
    });
  };

  return (
    <GeoJSON
      key={`${selectedCountryCode ?? 'all'}-${activeHover ?? 'none'}-${themeRev}`}
      data={data}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
});
