import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { PlatformModule } from '@shared/types';
import styles from './ModuleCard.module.css';

interface ModuleCardProps {
  module: PlatformModule;
  compact?: boolean;
}

export function ModuleCard({ module, compact = false }: ModuleCardProps) {
  const { t } = useTranslation('modules');

  return (
    <Link to={module.route} className={styles.card}>
      <div className={styles.glow} aria-hidden />
      <span className={styles.icon} aria-hidden>{module.icon}</span>
      <div className={styles.content}>
        <h3>{t(`${module.id}.name`)}</h3>
        {!compact && <p>{t(`${module.id}.description`)}</p>}
      </div>
      <span className={`${styles.badge} ${styles[module.status]}`}>
        {t(`status.${module.status}`)}
      </span>
      <span className={styles.arrow} aria-hidden>→</span>
    </Link>
  );
}
