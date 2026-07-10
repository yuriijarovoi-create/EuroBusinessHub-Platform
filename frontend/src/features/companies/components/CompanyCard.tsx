import { useTranslation } from 'react-i18next';
import type { CompanyRecord } from '@shared/types';
import { GlassPanel } from '@/components/GlassPanel';
import styles from './CompanyCard.module.css';

interface CompanyCardProps {
  company: CompanyRecord;
  cityName: string;
  countryLabel: string;
  onView: (company: CompanyRecord) => void;
}

export function CompanyCard({ company, cityName, countryLabel, onView }: CompanyCardProps) {
  const { t } = useTranslation('workspace');

  return (
    <GlassPanel padding="md" className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.name}>{company.name}</h3>
        <div className={styles.badges}>
          {company.verified ? (
            <span className={styles.badgeVerified}>{t('companies.card.verified')}</span>
          ) : (
            <span className={styles.badgeDemo}>{t('companies.card.demo')}</span>
          )}
        </div>
      </div>

      <p className={styles.meta}>
        {cityName} · {countryLabel} · {t(`companies.industries.${company.industry}`)} ·{' '}
        {t(`companies.sizes.${company.companySize}`)}
      </p>

      <p className={styles.description}>{company.description}</p>

      {company.tags.length > 0 && (
        <ul className={styles.tags} aria-label={t('companies.card.tags')}>
          {company.tags.map((tag) => (
            <li key={tag} className={styles.tag}>
              {tag}
            </li>
          ))}
        </ul>
      )}

      <button type="button" className={styles.viewBtn} onClick={() => onView(company)}>
        {t('companies.card.view')}
      </button>
    </GlassPanel>
  );
}
