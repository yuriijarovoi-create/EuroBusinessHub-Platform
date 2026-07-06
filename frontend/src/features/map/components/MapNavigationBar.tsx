import { useTranslation } from 'react-i18next';
import type { MapCountry } from '@shared/types';
import { useOptionalMapContext } from '../context/MapContext';
import styles from '../InteractiveEuropeMap.module.css';

export interface MapNavigationBarProps {
  /** Enterprise map — controlled country focus from BusinessOperatingMap */
  countryFocusActive?: boolean;
  selectedCountry?: MapCountry | null;
  onExitCountryFocus?: () => void;
}

export function MapNavigationBar({
  countryFocusActive: controlledFocus,
  selectedCountry: controlledCountry,
  onExitCountryFocus,
}: MapNavigationBarProps = {}) {
  const { t } = useTranslation('map');
  const legacy = useOptionalMapContext();

  const isControlled = controlledFocus !== undefined || onExitCountryFocus !== undefined;
  const countryFocusActive = isControlled
    ? Boolean(controlledFocus)
    : Boolean(legacy && legacy.navigation.phase !== 'europe');
  const selectedCountry = isControlled ? (controlledCountry ?? null) : (legacy?.selectedCountry ?? null);

  const handleEuropeClick = () => {
    if (countryFocusActive) {
      if (onExitCountryFocus) onExitCountryFocus();
      else legacy?.resetToEurope();
      return;
    }
    legacy?.resetToEurope();
  };

  return (
    <div className={styles.navBar} role="navigation" aria-label={t('nav.europe')}>
      <button type="button" className={styles.navCrumb} onClick={handleEuropeClick}>
        {t('nav.europe')}
      </button>
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
