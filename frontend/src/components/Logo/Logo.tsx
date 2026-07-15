import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { routes } from '@/config';
import styles from './Logo.module.css';

interface LogoProps {
  compact?: boolean;
}

export function Logo({ compact = false }: LogoProps) {
  const { t } = useTranslation('common');

  return (
    <Link to={routes.home} className={`${styles.logo} ${compact ? styles.compact : ''}`}>
      <span className={styles.mark}>
        <svg viewBox="0 0 32 32" className={styles.svg} aria-hidden>
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f4c81" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
          <path d="M8 22 L16 10 L24 22 Z" fill="none" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="16" cy="18" r="2" fill="white" />
        </svg>
      </span>
      {!compact && (
        <span className={styles.text}>
          <strong>EuroBusinessHub</strong>
          <small>{t('app.osTagline')}</small>
        </span>
      )}
    </Link>
  );
}
