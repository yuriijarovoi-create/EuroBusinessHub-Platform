import { useTranslation } from 'react-i18next';
import { ModuleGrid } from '@/features/modules/ModuleGrid';
import { SectionHeader } from '@/components/SectionHeader';
import styles from './ModulesPage.module.css';

export function ModulesPage() {
  const { t } = useTranslation('modules');

  return (
    <div className={styles.page}>
      <SectionHeader title={t('allModules')} subtitle={t('overview')} />
      <ModuleGrid />
    </div>
  );
}
