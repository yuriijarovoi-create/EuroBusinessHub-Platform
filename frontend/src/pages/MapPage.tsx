import { useSearchParams } from 'react-router-dom';
import { InteractiveEuropeMap } from '@/features/map/components/InteractiveEuropeMap';
import styles from './MapPage.module.css';

export function MapPage() {
  const [searchParams] = useSearchParams();
  const focusCityId = searchParams.get('city') ?? undefined;

  return (
    <div className={styles.page}>
      <InteractiveEuropeMap focusCityId={focusCityId} className={styles.mapFull} />
    </div>
  );
}
