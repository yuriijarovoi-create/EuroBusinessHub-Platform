import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './CountryFocusBackButton.module.css';

const EXIT_MS = 200;

function ArrowLeftIcon() {
  return (
    <svg
      className={styles.icon}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );
}

interface CountryFocusBackButtonProps {
  active: boolean;
  onClick: () => void;
}

/** Floating ← Europe control — reuses parent exit handler (same as Home). */
export function CountryFocusBackButton({ active, onClick }: CountryFocusBackButtonProps) {
  const { t } = useTranslation('map');
  const [mounted, setMounted] = useState(active);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (active) {
      setMounted(true);
      setExiting(false);
      return;
    }

    if (!mounted) return;

    setExiting(true);
    const timer = window.setTimeout(() => {
      setMounted(false);
      setExiting(false);
    }, EXIT_MS);

    return () => window.clearTimeout(timer);
  }, [active, mounted]);

  if (!mounted) return null;

  const className = [
    styles.backBtn,
    active && !exiting ? styles.backBtnVisible : '',
    exiting ? styles.backBtnExiting : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-label={t('nav.backToEurope')}
    >
      <ArrowLeftIcon />
      <span className={styles.label}>{t('nav.europe')}</span>
    </button>
  );
}
