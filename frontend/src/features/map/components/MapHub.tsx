import { HUB } from '../data/europeGeo';
import styles from '../EuropeMap.module.css';

interface MapHubProps {
  label: string;
}

export function MapHub({ label }: MapHubProps) {
  return (
    <g transform={`translate(${HUB.x}, ${HUB.y})`}>
      <ellipse cx="0" cy="0" rx="12" ry="10" fill="url(#hubGlow)" className={styles.germanyGlow} />
      <circle r="3.5" fill="none" stroke="var(--color-accent)" strokeWidth="0.3" className={styles.aiPulse1} />
      <circle r="3.5" fill="none" stroke="var(--color-accent)" strokeWidth="0.25" className={styles.aiPulse2} />
      <circle r="2.4" fill="var(--color-map-hub)" filter="url(#glow)" className={styles.hubCore} />
      <text y="-5" textAnchor="middle" className={styles.hubLabel}>{label}</text>
    </g>
  );
}

export { HUB };
