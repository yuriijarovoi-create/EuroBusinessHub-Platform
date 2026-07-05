import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { businessModules } from '@/data/modules';
import styles from './Sidebar.module.css';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useTranslation(['common', 'modules']);

  return (
    <>
      {open && (
        <button
          type="button"
          className={styles.backdrop}
          onClick={onClose}
          aria-label="Menü schließen"
        />
      )}
      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`} aria-hidden={!open}>
        <div className={styles.section}>
          <h2>{t('common:nav.modules')}</h2>
          <ul>
            {businessModules.map((mod) => (
              <li key={mod.id}>
                <Link to={mod.route} onClick={onClose} className={styles.moduleLink}>
                  <span aria-hidden>{mod.icon}</span>
                  <span>{t(`modules:${mod.id}.name`)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.future}>
          <p>{t('common:future.auth')}</p>
          <p>{t('common:future.payments')}</p>
          <p>{t('common:future.agents')}</p>
          <p>{t('common:future.automation')}</p>
        </div>
      </aside>
    </>
  );
}
