import { useTranslation } from 'react-i18next';
import { SectionHeader } from '@/components/SectionHeader';
import { PlatformStats } from '@/components/PlatformStats';
import styles from './HomeStatsSection.module.css';

export function HomeStatsSection() {
  const { t } = useTranslation('common');

  return (
    <section className={styles.section}>
      <SectionHeader
        eyebrow="Live"
        title={t('stats.title')}
        subtitle={t('stats.subtitle')}
      />
      <PlatformStats />
    </section>
  );
}
