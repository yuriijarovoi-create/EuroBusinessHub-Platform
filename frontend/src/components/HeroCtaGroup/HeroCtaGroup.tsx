import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { heroCtaLinks } from '@/data/platformStats';
import styles from './HeroCtaGroup.module.css';

export function HeroCtaGroup() {
  const { t } = useTranslation('common');

  return (
    <div className={styles.group}>
      {heroCtaLinks.map((cta, i) => (
        <Link
          key={cta.id}
          to={cta.route}
          className={styles.cta}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <span aria-hidden>{cta.icon}</span>
          {t(`hero.ctaButtons.${cta.id}`)}
        </Link>
      ))}
    </div>
  );
}
