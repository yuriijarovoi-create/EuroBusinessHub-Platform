import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { CompanyRecord } from '@shared/types';
import styles from './CompanyDetailsPanel.module.css';

interface CompanyDetailsPanelProps {
  company: CompanyRecord;
  cityName: string;
  countryLabel: string;
  onClose: () => void;
}

export function CompanyDetailsPanel({
  company,
  cityName,
  countryLabel,
  onClose,
}: CompanyDetailsPanelProps) {
  const { t } = useTranslation('workspace');
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="company-details-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <h2 id="company-details-title" className={styles.title}>
              {company.name}
            </h2>
            <p className={styles.subtitle}>
              {cityName} · {countryLabel} · {t(`companies.industries.${company.industry}`)}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t('companies.details.close')}
          >
            ×
          </button>
        </header>

        <div className={styles.body}>
          <p className={styles.demoNotice}>{t('companies.demoNotice')}</p>

          <dl className={styles.facts}>
            <div>
              <dt>{t('companies.details.size')}</dt>
              <dd>{t(`companies.sizes.${company.companySize}`)}</dd>
            </div>
            <div>
              <dt>{t('companies.details.status')}</dt>
              <dd>{t(`companies.statuses.${company.status}`)}</dd>
            </div>
            <div>
              <dt>{t('companies.details.verification')}</dt>
              <dd>
                {company.verified
                  ? t('companies.card.verified')
                  : t('companies.card.demo')}
              </dd>
            </div>
            {company.employees != null && (
              <div>
                <dt>{t('companies.details.employees')}</dt>
                <dd>{company.employees}</dd>
              </div>
            )}
          </dl>

          <section>
            <h3>{t('companies.details.description')}</h3>
            <p>{company.description}</p>
          </section>

          {company.tags.length > 0 && (
            <section>
              <h3>{t('companies.details.tags')}</h3>
              <ul className={styles.tags}>
                {company.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </section>
          )}

          {company.opportunities && company.opportunities.length > 0 && (
            <section>
              <h3>{t('companies.details.opportunities')}</h3>
              <ul className={styles.list}>
                {company.opportunities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h3>{t('companies.details.location')}</h3>
            <p>
              {cityName}, {countryLabel}
              {company.coordinates
                ? ` · ${company.coordinates.lat.toFixed(4)}, ${company.coordinates.lng.toFixed(4)}`
                : ''}
            </p>
          </section>

          {company.website && (
            <section>
              <h3>{t('companies.details.website')}</h3>
              <p className={styles.website}>{company.website}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
