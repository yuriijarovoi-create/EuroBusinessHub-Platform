import { useTranslation } from 'react-i18next';
import { useMapContext } from '../context/MapContext';
import styles from '../InteractiveEuropeMap.module.css';

export function MapNavigationBar() {
  const { t } = useTranslation('map');
  const { navigation, selectedCountry, resetToEurope } = useMapContext();

  return (
    <div className={styles.navBar}>
      <button type="button" className={styles.navCrumb} onClick={resetToEurope}>
        {t('nav.europe')}
      </button>
      {selectedCountry && (
        <>
          <span className={styles.navSep}>/</span>
          <span className={styles.navActive}>{selectedCountry.name}</span>
        </>
      )}
      {navigation.phase === 'country' && selectedCountry && (
        <span className={styles.navHint}>{t('nav.selectCity')}</span>
      )}
    </div>
  );
}
