import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getModuleById } from '@/data/modules';
import type { ModuleId } from '@shared/types';
import styles from './ModulePage.module.css';

export function ModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { t } = useTranslation(['modules', 'common']);
  const mod = moduleId ? getModuleById(moduleId as ModuleId) : undefined;

  if (!mod) {
    return (
      <div className={styles.notFound}>
        <h1>Modul nicht gefunden</h1>
        <Link to="/modules">← {t('modules:allModules')}</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/modules">← {t('modules:allModules')}</Link>
      </nav>

      <header className={styles.header}>
        <span className={styles.icon} aria-hidden>{mod.icon}</span>
        <div>
          <h1>{t(`modules:${mod.id}.name`)}</h1>
          <p>{t(`modules:${mod.id}.description`)}</p>
          <span className={`${styles.badge} ${styles[mod.status]}`}>
            {t(`modules:status.${mod.status}`)}
          </span>
        </div>
      </header>

      <div className={styles.placeholder}>
        <h2>Modul-Arbeitsbereich</h2>
        <p>
          Dieses Modul ist als Platzhalter vorbereitet. Mock-Daten werden hier
          angezeigt, bis Backend-APIs angebunden sind.
        </p>
        <ul className={styles.future}>
          <li>{t('common:future.auth')}</li>
          <li>{t('common:future.payments')}</li>
          <li>{t('common:future.agents')}</li>
          <li>{t('common:future.automation')}</li>
        </ul>
      </div>
    </div>
  );
}
