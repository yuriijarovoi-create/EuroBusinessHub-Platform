import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { routes } from '@/config';
import styles from './UserMenu.module.css';

export function UserMenu() {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        title={t('future.auth')}
      >
        <span className={styles.avatar}>G</span>
        <span className={styles.name}>{t('userMenu.guest')}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path fill="currentColor" d="M3 5l3 3 3-3" />
        </svg>
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          <div className={styles.guestNote}>{t('future.auth')}</div>
          <Link to={routes.login} className={styles.item} role="menuitem" onClick={() => setOpen(false)}>
            {t('nav.login')}
          </Link>
          <Link to={routes.register} className={styles.item} role="menuitem" onClick={() => setOpen(false)}>
            {t('nav.register')}
          </Link>
          <hr className={styles.divider} />
          <Link to={routes.dashboard} className={styles.item} role="menuitem" onClick={() => setOpen(false)}>
            {t('nav.dashboard')}
          </Link>
          <Link to={routes.companyDashboard} className={styles.item} role="menuitem" onClick={() => setOpen(false)}>
            {t('userMenu.company')}
          </Link>
        </div>
      )}
    </div>
  );
}
