import { memo, useMemo, useRef, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import type { Layer } from 'leaflet';
import L from 'leaflet';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { MapCountry } from '@shared/types';
import { europeCountriesGeoJson } from '../data/europeCountriesGeoJson';
import {
  getEuropeCountryGeoStyles,
  useMapThemeRevision,
} from '../utils/mapThemeUtils';
import {
  resolveCountryIso,
  resolveCountryLayerState,
  styleForCountryState,
} from '../utils/countryLayerUtils';

export interface CountryLayerProps {
  countries: MapCountry[];
  selectedCountryCode?: string;
  hoveredCountryCode?: string;
  onCountrySelect?: (isoCode: string) => void;
  onCountryHover?: (isoCode: string | null) => void;
  onExitCountryFocus?: () => void;
}

function filterGeoJsonForRegistry(
  data: FeatureCollection,
  registeredCodes: Set<string>,
): FeatureCollection {
  return {
    ...data,
    features: data.features.filter((f) => {
      const iso = f.properties?.ISO_A2 as string | undefined;
      return iso && iso !== '-99' && registeredCodes.has(iso);
    }),
  };
}

export const CountryLayer = memo(function CountryLayer({
  countries,
  selectedCountryCode,
  hoveredCountryCode,
  onCountrySelect,
  onCountryHover,
  onExitCountryFocus,
}: CountryLayerProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const activeHover = hoveredCountryCode ?? hovered;
  const themeRev = useMapThemeRevision();
  const geoStyles = useMemo(() => getEuropeCountryGeoStyles(), [themeRev]);
  const stylesRef = useRef(geoStyles);
  stylesRef.current = geoStyles;

  const countryByCode = useMemo(
    () => new Map(countries.map((c) => [c.code, c])),
    [countries],
  );

  const registeredCodes = useMemo(
    () => new Set(countries.map((c) => c.code)),
    [countries],
  );

  const geoData = useMemo(
    () => filterGeoJsonForRegistry(europeCountriesGeoJson, registeredCodes),
    [registeredCodes],
  );

  const style = useMemo(
    () => (feature?: Feature<Geometry>) => {
      const iso = resolveCountryIso(feature);
      const state = resolveCountryLayerState(iso, selectedCountryCode, activeHover ?? undefined);
      const base = styleForCountryState(state, stylesRef.current);
      return {
        ...base,
        className: `ebh-country-polygon ebh-country-${state}`,
      };
    },
    [selectedCountryCode, activeHover, themeRev],
  );

  const onEachFeature = (feature: Feature<Geometry>, layer: Layer) => {
    const iso = resolveCountryIso(feature);
    if (!iso) return;

    const country = countryByCode.get(iso);
    if (!country) return;

    const path = layer as Layer & {
      setStyle: (s: ReturnType<typeof style>) => void;
      options?: { className?: string };
    };

    if (path.options) {
      path.options.className = 'ebh-country-interactive';
    }

    layer.on({
      mouseover: () => {
        const state = resolveCountryLayerState(iso, selectedCountryCode, iso);
        path.setStyle({
          ...styleForCountryState(state, stylesRef.current),
          className: 'ebh-country-polygon ebh-country-hover',
        });
        setHovered(iso);
        onCountryHover?.(iso);
      },
      mouseout: () => {
        setHovered(null);
        onCountryHover?.(null);
        const state = resolveCountryLayerState(iso, selectedCountryCode, undefined);
        path.setStyle({
          ...styleForCountryState(state, stylesRef.current),
          className: `ebh-country-polygon ebh-country-${state}`,
        });
      },
      click: (e) => {
        L.DomEvent.stopPropagation(e);
        if (selectedCountryCode && iso !== selectedCountryCode) {
          onExitCountryFocus?.();
          return;
        }
        onCountrySelect?.(iso);
      },
      dblclick: (e) => {
        L.DomEvent.stopPropagation(e);
        if (selectedCountryCode && iso === selectedCountryCode) return;
        onExitCountryFocus?.();
      },
    });
  };

  return (
    <GeoJSON
      key={`countries-${selectedCountryCode ?? 'all'}-${activeHover ?? 'none'}-${themeRev}-${registeredCodes.size}`}
      data={geoData}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
});

/** @deprecated Use CountryLayer — kept for existing imports */
export const EuropeGeoJsonLayer = CountryLayer;
