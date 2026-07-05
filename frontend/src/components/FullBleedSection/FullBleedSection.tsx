import type { ReactNode } from 'react';
import styles from './FullBleedSection.module.css';

interface FullBleedSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  ariaLabel?: string;
}

/** Breaks out of the content container for full-viewport-width sections */
export function FullBleedSection({
  children,
  className = '',
  id,
  ariaLabel,
}: FullBleedSectionProps) {
  return (
    <section
      id={id}
      className={`${styles.section} ${className}`}
      aria-label={ariaLabel}
    >
      <div className={styles.inner}>{children}</div>
    </section>
  );
}
