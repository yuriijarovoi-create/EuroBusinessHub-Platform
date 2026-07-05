import type { ReactNode, HTMLAttributes } from 'react';
import styles from './GlassPanel.module.css';

interface GlassPanelProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: 'div' | 'section' | 'article';
  variant?: 'default' | 'strong' | 'subtle';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function GlassPanel({
  children,
  as: Tag = 'div',
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}: GlassPanelProps) {
  return (
    <Tag
      className={`${styles.panel} ${styles[variant]} ${styles[`pad-${padding}`]} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
