import { useTranslation } from 'react-i18next';
import { homepageModules } from '@/data/modules';
import { ModuleCard } from '@/components/ModuleCard';
import styles from './ModuleGrid.module.css';

interface ModuleGridProps {
  compact?: boolean;
  filterIds?: string[];
}

export function ModuleGrid({ compact = false, filterIds }: ModuleGridProps) {
  const { t } = useTranslation('modules');

  const modules = filterIds
    ? homepageModules.filter((m) => filterIds.includes(m.id))
    : homepageModules;

  return (
    <section className={styles.gridSection}>
      {!compact && (
        <header className={styles.header}>
          <h2>{t('allModules')}</h2>
        </header>
      )}
      <div className={`${styles.grid} ${compact ? styles.compact : ''}`}>
        {modules.map((mod) => (
          <ModuleCard key={mod.id} module={mod} compact={compact} />
        ))}
      </div>
    </section>
  );
}
