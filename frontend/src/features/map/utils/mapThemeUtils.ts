import { useEffect, useState } from 'react';
import type { PathOptions } from 'leaflet';

export function useMapThemeRevision(): number {
  const [rev, setRev] = useState(0);

  useEffect(() => {
    const bump = () => setRev((r) => r + 1);
    const obs = new MutationObserver(bump);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', bump);
    return () => {
      obs.disconnect();
      mq.removeEventListener('change', bump);
    };
  }, []);

  return rev;
}

function cssVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function cssNum(name: string, fallback: number): number {
  const v = parseFloat(cssVar(name, String(fallback)));
  return Number.isFinite(v) ? v : fallback;
}

export interface EuropeGeoStyles {
  base: PathOptions;
  coast: PathOptions;
  hover: PathOptions;
  selected: PathOptions;
  selectedDe: PathOptions;
  dim: PathOptions;
}

export function getEuropeCountryGeoStyles(): EuropeGeoStyles {
  const base: PathOptions = {
    fillColor: cssVar('--map-country-fill', '#1c2d45'),
    fillOpacity: cssNum('--map-country-fill-opacity', 0.56),
    color: cssVar('--map-country-stroke', '#5da8d8'),
    weight: 1,
    opacity: cssNum('--map-country-stroke-opacity', 0.72),
  };

  return {
    base,
    coast: {
      ...base,
      weight: 1.15,
      opacity: cssNum('--map-country-coast-opacity', 0.8),
    },
    hover: {
      fillColor: cssVar('--map-country-hover-fill', '#243f62'),
      fillOpacity: cssNum('--map-country-hover-fill-opacity', 0.72),
      color: cssVar('--map-country-hover-stroke', '#8dd8fc'),
      weight: 1.5,
      opacity: cssNum('--map-country-hover-stroke-opacity', 0.95),
    },
    selected: {
      fillColor: cssVar('--map-country-selected-fill', '#3d4f63'),
      fillOpacity: cssNum('--map-country-selected-fill-opacity', 0.82),
      weight: 2,
      color: cssVar('--map-country-selected-stroke', '#fbbf24'),
      opacity: 1,
    },
    selectedDe: {
      fillColor: cssVar('--map-country-selected-fill', '#3d4f63'),
      fillOpacity: cssNum('--map-country-selected-de-opacity', 0.68),
      weight: 2.6,
      color: cssVar('--map-country-selected-stroke', '#fbbf24'),
      opacity: 1,
    },
    dim: {
      fillColor: cssVar('--map-country-dim-fill', '#121c2a'),
      fillOpacity: cssNum('--map-country-dim-fill-opacity', 0.38),
      color: cssVar('--map-country-dim-stroke', '#2d4a68'),
      weight: 0.65,
      opacity: cssNum('--map-country-dim-stroke-opacity', 0.38),
    },
  };
}

export interface BundeslandGeoStyles {
  base: PathOptions;
  hover: PathOptions;
  selected: PathOptions;
  dim: PathOptions;
}

export function getBundeslandGeoStyles(): BundeslandGeoStyles {
  return {
    base: {
      fillColor: cssVar('--map-bl-fill', '#243d5c'),
      fillOpacity: cssNum('--map-bl-fill-opacity', 0.26),
      color: cssVar('--map-bl-stroke', '#52c4f0'),
      weight: 1.1,
      opacity: cssNum('--map-bl-stroke-opacity', 0.62),
    },
    hover: {
      fillColor: cssVar('--map-bl-hover-fill', '#2d5490'),
      fillOpacity: cssNum('--map-bl-hover-fill-opacity', 0.38),
      color: cssVar('--map-bl-hover-stroke', '#8dd8fc'),
      weight: 1.65,
      opacity: 0.9,
    },
    selected: {
      fillColor: cssVar('--map-bl-selected-fill', '#3d4f63'),
      fillOpacity: cssNum('--map-bl-selected-fill-opacity', 0.5),
      color: cssVar('--map-bl-selected-stroke', '#fbbf24'),
      weight: 2.2,
      opacity: 1,
    },
    dim: {
      fillColor: cssVar('--map-bl-dim-fill', '#141e2e'),
      fillOpacity: cssNum('--map-bl-dim-fill-opacity', 0.14),
      color: cssVar('--map-bl-dim-stroke', '#2d4a68'),
      weight: 0.7,
      opacity: cssNum('--map-bl-dim-stroke-opacity', 0.32),
    },
  };
}

export function getRouteColorsFromTheme(): Record<string, string> {
  return {
    road: cssVar('--map-route-road', '#2a9fc9'),
    rail: cssVar('--map-route-rail', '#5b7f9d'),
    air: cssVar('--map-route-air', '#b8cfe8'),
    sea: cssVar('--map-route-sea', '#3d9eae'),
    river: cssVar('--map-route-river', '#3aada8'),
  };
}

export function getRouteThemeFromCss() {
  return {
    glowBase: cssNum('--map-route-glow-base', 0.08),
    glowIntensity: cssNum('--map-route-glow-intensity', 0.03),
    lineBase: cssNum('--map-route-line-base', 0.35),
    lineIntensity: cssNum('--map-route-line-intensity', 0.08),
    highlight: cssVar('--map-route-highlight', '#f0f9ff'),
    particleStroke: cssVar('--map-route-particle-stroke', '#f0f9ff'),
  };
}

export function getResolvedMapTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'dark';
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme === 'light' || theme === 'dark') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
