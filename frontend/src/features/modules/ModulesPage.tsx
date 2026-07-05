import { useTranslation } from 'react-i18next';
import { ModuleGrid } from '@/features/modules/ModuleGrid';
import styles from './ModulesPage.module.css';

export function ModulesPage() {
  const { t } = useTranslation('modules');

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>{t('allModules')}</h1>
        <p>EuroBusinessHub Module — Mock-Daten, keine Live-APIs</p>
      </header>
      <ModuleGrid />
    </div>
  );
}
