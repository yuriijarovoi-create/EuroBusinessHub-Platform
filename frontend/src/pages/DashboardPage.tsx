import { useTranslation } from 'react-i18next';
import { SectionHeader } from '@/components/SectionHeader';
import { DashboardMetrics } from '@/components/DashboardMetrics';
import { PlatformStats } from '@/components/PlatformStats';
import { GlassPanel } from '@/components/GlassPanel';
import { aiCapabilities } from '@/data/aiCapabilities';
import type { AiCapability } from '@shared/types';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const { t } = useTranslation('common');

  return (
    <div className={styles.page}>
      <SectionHeader
        title={t('nav.dashboard')}
        subtitle={t('dashboard.subtitle')}
      />

      <DashboardMetrics />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('stats.title')}</h2>
        <PlatformStats />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('ai.title')}</h2>
        <div className={styles.aiGrid}>
          {aiCapabilities.capabilities.map((cap: AiCapability) => (
            <GlassPanel key={cap.id} padding="md" className={styles.aiCard}>
              <span className={styles.aiStatus}>{cap.status}</span>
              <strong>{cap.name}</strong>
              <p>{cap.description}</p>
            </GlassPanel>
          ))}
        </div>
      </section>

      <GlassPanel padding="md" className={styles.note}>
        <p>{t('future.auth')}</p>
      </GlassPanel>
    </div>
  );
}
