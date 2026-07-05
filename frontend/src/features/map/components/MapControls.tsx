import { useTranslation } from 'react-i18next';
import { useLeafletMap } from '../context/LeafletMapContext';
import { useMapContext } from '../context/MapContext';
import styles from '../InteractiveEuropeMap.module.css';

export function MapControls() {
  const { t } = useTranslation('map');
  const leaflet = useLeafletMap();
  const { viewport, resetToEurope, navigation } = useMapContext();

  const zoomIn = leaflet.map ? leaflet.zoomIn : viewport.zoomIn;
  const zoomOut = leaflet.map ? leaflet.zoomOut : viewport.zoomOut;
  const reset = leaflet.map ? leaflet.resetView : viewport.reset;

  return (
    <div className={styles.controls}>
      {navigation.phase !== 'europe' && (
        <button type="button" className={styles.controlBtn} onClick={resetToEurope} title={t('controls.reset')}>
          ← {t('controls.backEurope')}
        </button>
      )}
      <button type="button" className={styles.controlBtn} onClick={zoomIn} aria-label={t('controls.zoomIn')}>+</button>
      <button type="button" className={styles.controlBtn} onClick={zoomOut} aria-label={t('controls.zoomOut')}>−</button>
      <button type="button" className={styles.controlBtn} onClick={reset} aria-label={t('controls.reset')}>⌂</button>
    </div>
  );
}
