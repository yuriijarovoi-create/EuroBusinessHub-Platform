import type { ReactNode } from 'react';
import styles from './SectionHeader.module.css';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  action?: ReactNode;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  action,
}: SectionHeaderProps) {
  return (
    <header className={`${styles.header} ${styles[align]}`}>
      <div className={styles.text}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </header>
  );
}
