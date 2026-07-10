import { useTranslation } from 'react-i18next';
import type { MapCountry } from '@shared/types';
import { useOptionalMapContext } from '../context/MapContext';
import type { MapCityRecord } from '../types/mapTypes';
import type { ActiveMapContext } from '../utils/mapLayerContext';
import { MapCitySearch } from './MapCitySearch';
import styles from '../InteractiveEuropeMap.module.css';

export interface MapNavigationBarProps {
  /** Enterprise map — controlled country focus from BusinessOperatingMap */
  countryFocusActive?: boolean;
  selectedCountry?: MapCountry | null;
  onExitCountryFocus?: () => void;
  /** Geographic city focus (search / selection) */
  selectedCityId?: string | null;
  activeMapContext?: ActiveMapContext;
  onCitySearchSelect?: (city: MapCityRecord) => void;
  onResetGeographicFocus?: () => void;
}

export function MapNavigationBar({
  countryFocusActive: controlledFocus,
  selectedCountry: controlledCountry,
  onExitCountryFocus,
  selectedCityId = null,
  activeMapContext,
  onCitySearchSelect,
  onResetGeographicFocus,
}: MapNavigationBarProps = {}) {
  const { t } = useTranslation('map');
  const legacy = useOptionalMapContext();

  const isControlled = controlledFocus !== undefined || onExitCountryFocus !== undefined;
  const countryFocusActive = isControlled
    ? Boolean(controlledFocus)
    : Boolean(legacy && legacy.navigation.phase !== 'europe');
  const selectedCountry = isControlled ? (controlledCountry ?? null) : (legacy?.selectedCountry ?? null);

  const handleResetFocus = () => {
    if (countryFocusActive) {
      if (onExitCountryFocus) onExitCountryFocus();
      else legacy?.resetToEurope();
      return;
    }
    if (onResetGeographicFocus) {
      onResetGeographicFocus();
      return;
    }
    legacy?.resetToEurope();
  };

  const showEnterpriseSearch = Boolean(activeMapContext && onCitySearchSelect && onResetGeographicFocus);

  return (
    <div className={styles.navBar} role="navigation" aria-label={t('nav.europe')}>
      {showEnterpriseSearch ? (
        <MapCitySearch
          selectedCityId={selectedCityId}
          activeMapContext={activeMapContext!}
          onSelectCity={(city) => onCitySearchSelect!(city)}
          onResetFocus={handleResetFocus}
          countryFocusActive={countryFocusActive}
        />
      ) : (
        <button type="button" className={styles.navCrumb} onClick={handleResetFocus}>
          {t('nav.europe')}
        </button>
      )}
      {selectedCountry && countryFocusActive && (
        <>
          <span className={styles.navSep} aria-hidden>
            &gt;
          </span>
          <span className={styles.navActive}>{selectedCountry.name}</span>
        </>
      )}
      {countryFocusActive && selectedCountry && (
        <span className={styles.navHint}>{t('nav.selectCity')}</span>
      )}
    </div>
  );
}
