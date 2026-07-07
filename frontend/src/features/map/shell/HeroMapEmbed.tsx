import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapProvider } from '../context/MapContext';
import type { MapCityRecord } from '../types/mapTypes';
import styles from './BusinessOperatingMap.module.css';

const BusinessOperatingMap = lazy(() =>
  import('./BusinessOperatingMap').then((m) => ({ default: m.BusinessOperatingMap })),
);

interface HeroMapEmbedProps {
  className?: string;
}

export function HeroMapEmbed({ className = '' }: HeroMapEmbedProps) {
  const navigate = useNavigate();

  const handleWorkspace = (city: MapCityRecord) => {
    navigate(`/workspace/${city.id}`);
  };

  return (
    <Suspense fallback={null}>
      <MapProvider>
        <div className={`${styles.heroEmbedWrap} ${className}`}>
          <BusinessOperatingMap mode="hero" onOpenWorkspace={handleWorkspace} />
        </div>
      </MapProvider>
    </Suspense>
  );
}
