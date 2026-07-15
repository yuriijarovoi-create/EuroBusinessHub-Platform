import { useTranslation } from 'react-i18next';
import { SectionHeader } from '@/components/SectionHeader';
import { ModuleCard } from '@/components/ModuleCard';
import { homepageModules } from '@/data/modules';
import styles from './HomeModulesSection.module.css';

export function HomeModulesSection() {
  const { t } = useTranslation('common');

  return (
    <section className={styles.section}>
      <SectionHeader
        eyebrow={t('sectionEyebrows.modules')}
        title={t('modules.title')}
        subtitle={t('modules.subtitle')}
      />
      <div className={styles.grid}>
        {homepageModules.map((mod, i) => (
          <div key={mod.id} className={styles.item} style={{ animationDelay: `${i * 50}ms` }}>
            <ModuleCard module={mod} />
          </div>
        ))}
      </div>
    </section>
  );
}
