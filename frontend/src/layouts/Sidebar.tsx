import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSidebarModules } from '@/data/modules';
import styles from './Sidebar.module.css';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useTranslation(['common', 'modules']);
  const modules = getSidebarModules();

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
        <nav className={styles.nav} aria-label={t('common:nav.modules')}>
          <ul>
            {modules.map((mod) => (
              <li key={mod.id}>
                <NavLink
                  to={mod.route}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `${styles.link} ${isActive ? styles.active : ''}`
                  }
                  end={mod.id === 'dashboard'}
                >
                  <span className={styles.icon} aria-hidden>{mod.icon}</span>
                  <span className={styles.label}>{t(`modules:${mod.id}.name`)}</span>
                  {mod.status === 'beta' && (
                    <span className={styles.statusBadge}>β</span>
                  )}
                  {mod.status === 'coming-soon' && (
                    <span className={styles.statusBadge}>⏳</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.footer}>
          <p>{t('common:footer.tagline')}</p>
        </div>
      </aside>
    </>
  );
}
