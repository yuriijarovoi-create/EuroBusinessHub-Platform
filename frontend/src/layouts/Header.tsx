import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { GlobalSearch } from '@/features/search/GlobalSearch';
import { Logo } from '@/components/Logo';
import { LanguageSelector } from './LanguageSelector';
import { NotificationsPanel } from './NotificationsPanel';
import { UserMenu } from './UserMenu';
import styles from './Header.module.css';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { t } = useTranslation('common');
  const { toggleTheme } = useTheme();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button
          type="button"
          className={styles.menuBtn}
          onClick={onMenuToggle}
          aria-label={t('nav.menuOpen')}
        >
          <span className={styles.menuIcon} />
        </button>

        <Logo />

        <div className={styles.search}>
          <GlobalSearch variant="header" />
        </div>

        <div className={styles.actions}>
          <LanguageSelector />
          <button
            type="button"
            className={styles.iconBtn}
            onClick={toggleTheme}
            aria-label={t('nav.theme')}
            title={t('nav.theme')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>
          <NotificationsPanel />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
