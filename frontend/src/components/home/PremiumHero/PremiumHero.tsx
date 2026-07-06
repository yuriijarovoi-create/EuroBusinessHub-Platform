import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { GlobalSearch } from '@/features/search/GlobalSearch';
import { HeroCtaGroup } from '@/components/HeroCtaGroup';
import { routes } from '@/config';
import { HeroMapEmbed } from '@/features/map/shell/HeroMapEmbed';
import styles from './PremiumHero.module.css';

export function PremiumHero() {
  const { t } = useTranslation('common');

  return (
    <header className={styles.hero}>
      <div className={styles.backdrop} aria-hidden>
        <HeroMapEmbed />
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.grid} />
      </div>

      <div className={styles.content}>
        <span className={styles.badge}>
          <span className={styles.liveDot} />
          {t('hero.badge')}
        </span>

        <h1 className={styles.headline}>
          <span className={styles.line1}>{t('hero.headlineLine1')}</span>
          <span className={styles.line2}>{t('hero.headlineLine2')}</span>
        </h1>

        <p className={styles.subtitle}>{t('app.subtitle')}</p>
        <p className={styles.description}>{t('app.description')}</p>

        <div className={styles.search}>
          <GlobalSearch variant="hero" />
        </div>

        <HeroCtaGroup />

        <Link to={routes.dashboard} className={styles.cta}>
          {t('hero.cta')}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
