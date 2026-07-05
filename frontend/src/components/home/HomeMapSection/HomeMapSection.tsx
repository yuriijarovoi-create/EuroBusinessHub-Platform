import { useTranslation } from 'react-i18next';
import { FullBleedSection } from '@/components/FullBleedSection';
import { SectionHeader } from '@/components/SectionHeader';
import { EuropeMap } from '@/features/map/EuropeMap';
import styles from './HomeMapSection.module.css';

export function HomeMapSection() {
  const { t } = useTranslation('map');

  return (
    <FullBleedSection id="map" ariaLabel={t('title')} className={styles.wrapper}>
      <div className={styles.section}>
        <div className={styles.headerWrap}>
          <SectionHeader
            eyebrow={t('eyebrow')}
            title={t('title')}
            subtitle={t('subtitle')}
            align="center"
          />
        </div>
        <EuropeMap variant="fullscreen" />
        <p className={styles.hint}>{t('interactionHint')}</p>
      </div>
    </FullBleedSection>
  );
}
