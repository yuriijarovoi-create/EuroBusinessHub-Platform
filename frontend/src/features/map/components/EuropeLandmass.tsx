import {
  ICELAND_ISLAND,
  IRELAND_ISLAND,
  MAINLAND_EUROPE,
  SICILY,
  UNITED_KINGDOM,
} from '../data/europeGeo';
import styles from '../EuropeMap.module.css';

export function EuropeLandmass() {
  return (
    <g className={styles.landmass}>
      <path d={MAINLAND_EUROPE} className={styles.landMain} />
      <path d={UNITED_KINGDOM} className={styles.landIsland} />
      <path d={IRELAND_ISLAND} className={styles.landIsland} />
      <path d={ICELAND_ISLAND} className={styles.landIsland} />
      <path d={SICILY} className={styles.landDetail} />
    </g>
  );
}
