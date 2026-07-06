import { useTranslation } from 'react-i18next';
import { useLeafletMap } from '../context/LeafletMapContext';
import { useOptionalMapContext } from '../context/MapContext';
import { mapSessionStore } from '../store/mapSessionStore';
import { flyToFullEuropeOverview } from '../utils/mapCameraSnapshot';
import styles from '../InteractiveEuropeMap.module.css';

export interface MapControlsProps {
  countryFocusActive?: boolean;
  onExitCountryFocus?: () => void;
}

export function MapControls({
  countryFocusActive: controlledFocus,
  onExitCountryFocus,
}: MapControlsProps = {}) {
  const { t } = useTranslation('map');
  const leaflet = useLeafletMap();
  const legacy = useOptionalMapContext();

  const isControlled = controlledFocus !== undefined || onExitCountryFocus !== undefined;
  const countryFocusActive = isControlled
    ? Boolean(controlledFocus)
    : Boolean(legacy && legacy.navigation.phase !== 'europe');

  const handleBackEurope = () => {
    leaflet.map?.stop();
    if (onExitCountryFocus) onExitCountryFocus();
    else legacy?.resetToEurope();
  };

  const handleHome = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    leaflet.map?.stop();
    const hadCountryFocus = countryFocusActive;
    mapSessionStore.requestHomeFullEuropeOverview();
    if (onExitCountryFocus) {
      onExitCountryFocus();
    } else if (leaflet.map) {
      leaflet.resetView();
    } else {
      legacy?.resetToEurope();
    }
    if (leaflet.map && !hadCountryFocus && mapSessionStore.consumeHomeFullEuropeOverview()) {
      flyToFullEuropeOverview(leaflet.map);
    }
  };

  const zoomIn = leaflet.map ? leaflet.zoomIn : legacy?.viewport.zoomIn;
  const zoomOut = leaflet.map ? leaflet.zoomOut : legacy?.viewport.zoomOut;

  return (
    <div className={styles.controls}>
      {countryFocusActive && (
        <button
          type="button"
          className={styles.controlBtn}
          onClick={handleBackEurope}
          title={t('nav.backToEurope')}
        >
          ← {t('controls.backEurope')}
        </button>
      )}
      <button type="button" className={styles.controlBtn} onClick={zoomIn} aria-label={t('controls.zoomIn')}>
        +
      </button>
      <button type="button" className={styles.controlBtn} onClick={zoomOut} aria-label={t('controls.zoomOut')}>
        −
      </button>
      <button type="button" className={styles.controlBtn} onClick={handleHome} aria-label={t('controls.reset')}>
        ⌂
      </button>
    </div>
  );
}
