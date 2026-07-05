import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { mockNotifications } from '@/features/notifications';
import styles from './NotificationsPanel.module.css';

export function NotificationsPanel() {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = mockNotifications.filter((n) => !n.read).length;

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
        aria-label={t('nav.notifications')}
        aria-expanded={open}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count > 0 && <span className={styles.badge}>{count}</span>}
      </button>

      {open && (
        <div className={styles.panel}>
          <header className={styles.header}>
            <strong>{t('nav.notifications')}</strong>
          </header>
          {mockNotifications.length === 0 ? (
            <p className={styles.empty}>{t('notifications.empty')}</p>
          ) : (
            <ul>
              {mockNotifications.map((n) => (
                <li key={n.id} className={styles.item}>
                  <span className={styles.itemTitle}>{n.title}</span>
                  <span className={styles.itemBody}>{n.body}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
