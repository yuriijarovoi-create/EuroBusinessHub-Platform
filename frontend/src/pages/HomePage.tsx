import {
  PremiumHero,
  HomeMapSection,
  HomeStatsSection,
  HomeDashboardSection,
  HomeModulesSection,
} from '@/components/home';
import styles from './HomePage.module.css';

export function HomePage() {
  return (
    <div className={styles.page}>
      <PremiumHero />
      <HomeMapSection />
      <HomeStatsSection />
      <HomeDashboardSection />
      <HomeModulesSection />
    </div>
  );
}
