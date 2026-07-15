import { Link, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getModuleById } from '@/data/modules';
import { getModuleMeta } from '@/modules';
import { GlassPanel } from '@/components/GlassPanel';
import type { ModuleId } from '@shared/types';
import styles from './ModulePage.module.css';

export function ModulePage() {
  const { moduleId: paramId } = useParams<{ moduleId: string }>();
  const location = useLocation();
  const resolvedId = (paramId ?? (location.pathname === '/admin' ? 'admin' : undefined)) as ModuleId | undefined;
  const { t } = useTranslation(['modules', 'common']);
  const mod = resolvedId ? getModuleById(resolvedId) : undefined;
  const meta = resolvedId ? getModuleMeta(resolvedId) : undefined;

  if (!mod) {
    return (
      <div className={styles.notFound}>
        <h1>{t('modules:notFound')}</h1>
        <Link to="/modules">← {t('modules:allModules')}</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/modules">← {t('modules:allModules')}</Link>
      </nav>

      <GlassPanel padding="lg" className={styles.header}>
        <span className={styles.icon} aria-hidden>{mod.icon}</span>
        <div>
          <h1>{t(`modules:${mod.id}.name`)}</h1>
          <p>{t(`modules:${mod.id}.description`)}</p>
          <span className={`${styles.badge} ${styles[mod.status]}`}>
            {t(`modules:status.${mod.status}`)}
          </span>
        </div>
      </GlassPanel>

      <GlassPanel padding="lg" className={styles.placeholder}>
        <h2>{t('modules:workspace.title')}</h2>
        <p>{t('modules:workspace.description')}</p>
        {meta && (
          <p className={styles.apiHint}>
            API: <code>{meta.apiPrefix}</code>
          </p>
        )}
        <ul className={styles.future}>
          <li>{t('common:future.auth')}</li>
          <li>{t('common:future.payments')}</li>
          <li>{t('common:future.agents')}</li>
          <li>{t('common:future.automation')}</li>
        </ul>
      </GlassPanel>
    </div>
  );
}
