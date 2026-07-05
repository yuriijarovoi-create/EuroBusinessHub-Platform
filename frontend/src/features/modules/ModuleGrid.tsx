import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { businessModules } from '@/data/modules';
import styles from './ModuleGrid.module.css';

interface ModuleGridProps {
  compact?: boolean;
  filterIds?: string[];
}

export function ModuleGrid({ compact = false, filterIds }: ModuleGridProps) {
  const { t } = useTranslation('modules');

  const modules = filterIds
    ? businessModules.filter((m) => filterIds.includes(m.id))
    : businessModules;

  return (
    <section className={styles.gridSection}>
      {!compact && (
        <header className={styles.header}>
          <h2>{t('allModules')}</h2>
        </header>
      )}
      <div className={`${styles.grid} ${compact ? styles.compact : ''}`}>
        {modules.map((mod) => (
          <Link key={mod.id} to={mod.route} className={styles.card}>
            <span className={styles.icon} aria-hidden>{mod.icon}</span>
            <div className={styles.content}>
              <h3>{t(`${mod.id}.name`)}</h3>
              {!compact && <p>{t(`${mod.id}.description`)}</p>}
            </div>
            <span className={`${styles.badge} ${styles[mod.status]}`}>
              {t(`status.${mod.status}`)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
