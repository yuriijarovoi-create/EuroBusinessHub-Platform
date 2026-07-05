import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cities } from '@/data/cities';
import { countries } from '@/data/countries';
import { getHubRoutes } from '@/utils/mapRoutes';
import { GlassPanel } from '@/components/GlassPanel';
import { useMapViewport } from './hooks/useMapViewport';
import { EuropeMapCanvas } from './components/EuropeMapCanvas';
import { MapLiveOverlay } from './components/MapLiveOverlay';
import type { City, EuropeMapVariant, MapCountry } from '@shared/types';
import styles from './EuropeMap.module.css';

const InteractiveEuropeMap = lazy(() =>
  import('./components/InteractiveEuropeMap').then((m) => ({ default: m.InteractiveEuropeMap })),
);

interface EuropeMapProps {
  variant?: EuropeMapVariant;
  selectedCityId?: string;
  selectedCountryCode?: string;
  onCitySelect?: (city: City) => void;
  onCountrySelect?: (country: MapCountry) => void;
  showHeader?: boolean;
}

export function EuropeMap({
  variant = 'section',
  selectedCityId,
  selectedCountryCode,
  onCitySelect,
  onCountrySelect,
  showHeader = true,
}: EuropeMapProps) {
  const { t } = useTranslation('map');
  const navigate = useNavigate();
  const { transform } = useMapViewport();
  const routes = getHubRoutes(cities);

  const handleCityClick = (city: City) => {
    onCitySelect?.(city);
    navigate(`/workspace/${city.id}`);
  };

  const handleCountryClick = (country: MapCountry) => {
    onCountrySelect?.(country);
    if (country.hubCityId) {
      navigate(`/workspace/${country.hubCityId}`);
    }
  };

  const canvas = (
    <EuropeMapCanvas
      transform={transform}
      routes={routes}
      cities={cities}
      countries={countries}
      hubLabel={t('hubLabel')}
      selectedCityId={selectedCityId}
      selectedCountryCode={selectedCountryCode}
      showLabels={variant !== 'hero'}
      onCitySelect={handleCityClick}
      onCountrySelect={handleCountryClick}
      getCityAriaLabel={(city) => `${city.name}, ${t('businesses', { count: city.businesses })}`}
    />
  );

  const isFullscreen = variant === 'fullscreen';
  const isInteractive = variant === 'interactive';
  const isHero = variant === 'hero';

  if (isFullscreen || isInteractive) {
    return (
      <div
        className={`${styles.fullscreenWrapper} ${isInteractive ? styles.interactiveWrapper : ''}`}
        aria-label={t('title')}
      >
        <Suspense fallback={<div className={styles.mapLoading}>{t('loading')}</div>}>
          <InteractiveEuropeMap />
        </Suspense>
      </div>
    );
  }

  const mapContent = (
    <div
      className={`${styles.mapContainer} ${isHero ? styles.heroMap : ''} ${isFullscreen ? styles.fullscreenMap : ''}`}
    >
      {canvas}
      {isHero && (
        <MapLiveOverlay label={t('liveNetwork')} />
      )}
    </div>
  );

  if (isHero) {
    return <div className={styles.heroWrapper} aria-label={t('title')}>{mapContent}</div>;
  }

  return (
    <section className={styles.mapSection} id="map" aria-label={t('title')}>
      {showHeader && (
        <header className={styles.header}>
          <h2>{t('title')}</h2>
          <p>{t('subtitle')}</p>
        </header>
      )}
      <GlassPanel padding="sm">{mapContent}</GlassPanel>
      <p className={styles.hint}>{t('zoomHint')}</p>
    </section>
  );
}
