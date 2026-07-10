import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCityById } from '@/data/cities';
import { getCityCompanyStats, getCompaniesByCity } from '@/data/companies/getCompaniesByCity';
import { routes } from '@/config';
import { CityProvider } from '@/features/map/context/CityContext';
import { BackToEuropeMapLink } from '@/features/map/components/BackToEuropeMapLink';
import { mapSessionStore } from '@/features/map/store/mapSessionStore';
import {
  DEFAULT_ACTIVE_MAP_CONTEXT,
  setBusinessLayer,
} from '@/features/map/utils/mapLayerContext';
import { GlassPanel } from '@/components/GlassPanel';
import { CompanyCard } from '@/features/companies/components/CompanyCard';
import { CompanyDetailsPanel } from '@/features/companies/components/CompanyDetailsPanel';
import { COMPANY_INDUSTRY_IDS } from '@/features/companies/constants/companyIndustries';
import {
  DEFAULT_COMPANY_FILTERS,
  filterCompanies,
  hasActiveCompanyFilters,
  type CompanyFilterState,
} from '@/features/companies/utils/companyFilters';
import type { CompanyRecord, CompanySize, CompanyStatus } from '@shared/types';
import styles from './CityCompaniesPage.module.css';

function CompaniesBottomNavigation({ cityId }: { cityId: string }) {
  const { t } = useTranslation('workspace');

  return (
    <nav
      className={styles.bottomNavigation}
      aria-label={`${t('companies.backToCity')} · ${t('backToEuropeMap')}`}
    >
      <Link to={routes.workspace(cityId)} className={styles.actionBtn}>
        {t('companies.backToCity')}
      </Link>
      <BackToEuropeMapLink className={styles.actionBtn} />
    </nav>
  );
}

function CityCompaniesContent() {
  const { cityId } = useParams<{ cityId: string }>();
  const { t } = useTranslation(['workspace', 'modules']);
  const city = cityId ? getCityById(cityId) : undefined;
  const catalog = useMemo(() => (cityId ? getCompaniesByCity(cityId) : []), [cityId]);
  const stats = useMemo(() => (cityId ? getCityCompanyStats(cityId) : null), [cityId]);

  const [filters, setFilters] = useState<CompanyFilterState>(DEFAULT_COMPANY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyRecord | null>(null);

  useEffect(() => {
    if (!cityId) return;
    mapSessionStore.patch({
      viewMode: 'workspace',
      workspaceCityId: cityId,
      selectedCityId: cityId,
      focusCityId: cityId,
      infoCardCityId: cityId,
      activeMapContext: setBusinessLayer(DEFAULT_ACTIVE_MAP_CONTEXT, 'companies'),
    });
  }, [cityId]);

  const filteredCompanies = useMemo(
    () => filterCompanies(catalog, filters),
    [catalog, filters],
  );

  const filtersActive = hasActiveCompanyFilters(filters);

  if (!city) {
    return (
      <div className={styles.notFound}>
        <h1>{t('companies.notFoundCity')}</h1>
        <BackToEuropeMapLink />
      </div>
    );
  }

  const clearFilters = () => setFilters(DEFAULT_COMPANY_FILTERS);

  if (catalog.length === 0) {
    return (
      <div className={styles.page}>
        <nav className={styles.breadcrumb}>
          <Link to={routes.workspace(city.id)} className={styles.breadcrumbLink}>
            ← {t('companies.backToCity')}
          </Link>
          <BackToEuropeMapLink className={styles.breadcrumbLink} />
        </nav>

        <div className={styles.emptyState}>
          <h1>{t('companies.emptyCity.title', { city: city.name })}</h1>
          <p>{t('companies.emptyCity.body')}</p>
          <p className={styles.demoNotice}>{t('companies.demoNotice')}</p>
        </div>

        <CompaniesBottomNavigation cityId={city.id} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to={routes.workspace(city.id)} className={styles.breadcrumbLink}>
          ← {t('companies.backToCity')}
        </Link>
        <BackToEuropeMapLink className={styles.breadcrumbLink} />
      </nav>

      <header className={styles.header}>
        <div>
          <p className={styles.moduleLabel}>{t('modules:unternehmen.name')}</p>
          <h1>{t('companies.title', { city: city.name })}</h1>
          <p className={styles.subtitle}>
            {city.country} · {city.countryCode}
          </p>
          <p className={styles.demoNotice}>{t('companies.demoNotice')}</p>
        </div>
      </header>

      <section className={styles.statsRow} aria-label={t('companies.stats.label')}>
        {(
          [
            ['totalCompanies', stats?.totalCompanies ?? 0],
            ['verifiedProfiles', stats?.verifiedProfiles ?? 0],
            ['industries', stats?.industries ?? 0],
            ['openOpportunities', stats?.openOpportunities ?? 0],
          ] as const
        ).map(([key, value]) => (
          <GlassPanel key={key} padding="sm" className={styles.statCard}>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statLabel}>{t(`companies.stats.${key}`)}</span>
          </GlassPanel>
        ))}
      </section>

      <section className={styles.toolbarSection}>
        <div className={styles.toolbarTop}>
          <label className={styles.searchField}>
            <span className={styles.srOnly}>{t('companies.search.label')}</span>
            <input
              type="search"
              value={filters.query}
              onChange={(event) =>
                setFilters((current) => ({ ...current, query: event.target.value }))
              }
              placeholder={t('companies.search.placeholder')}
              className={styles.searchInput}
            />
            {filters.query && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setFilters((current) => ({ ...current, query: '' }))}
                aria-label={t('companies.search.clear')}
              >
                ×
              </button>
            )}
          </label>

          <button
            type="button"
            className={styles.filtersToggle}
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
          >
            {t('companies.filters.toggle')}
            {filtersActive ? ` (${t('companies.filters.active')})` : ''}
          </button>
        </div>

        <p className={styles.resultsMeta}>
          {t('companies.results.showing', {
            count: filteredCompanies.length,
            total: catalog.length,
          })}
        </p>

        <div className={`${styles.filtersPanel} ${filtersOpen ? styles.filtersPanelOpen : ''}`}>
          <div className={styles.filterGroup}>
            <label htmlFor="company-industry-filter">{t('companies.filters.industry')}</label>
            <select
              id="company-industry-filter"
              value={filters.industry}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  industry: event.target.value as CompanyFilterState['industry'],
                }))
              }
            >
              <option value="all">{t('companies.filters.all')}</option>
              {COMPANY_INDUSTRY_IDS.map((industryId) => (
                <option key={industryId} value={industryId}>
                  {t(`companies.industries.${industryId}`)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="company-size-filter">{t('companies.filters.size')}</label>
            <select
              id="company-size-filter"
              value={filters.companySize}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  companySize: event.target.value as CompanySize | 'all',
                }))
              }
            >
              <option value="all">{t('companies.filters.all')}</option>
              {(['micro', 'small', 'medium', 'large'] as const).map((size) => (
                <option key={size} value={size}>
                  {t(`companies.sizes.${size}`)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="company-status-filter">{t('companies.filters.status')}</label>
            <select
              id="company-status-filter"
              value={filters.status}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  status: event.target.value as CompanyStatus | 'all',
                }))
              }
            >
              <option value="all">{t('companies.filters.all')}</option>
              {(['active', 'inactive', 'pending'] as const).map((status) => (
                <option key={status} value={status}>
                  {t(`companies.statuses.${status}`)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="company-sort">{t('companies.filters.sort')}</label>
            <select
              id="company-sort"
              value={filters.sort}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  sort: event.target.value as CompanyFilterState['sort'],
                }))
              }
            >
              <option value="relevance">{t('companies.sort.relevance')}</option>
              <option value="name">{t('companies.sort.name')}</option>
              <option value="size">{t('companies.sort.size')}</option>
            </select>
          </div>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={filters.verifiedOnly}
              onChange={(event) =>
                setFilters((current) => ({ ...current, verifiedOnly: event.target.checked }))
              }
            />
            {t('companies.filters.verifiedOnly')}
          </label>

          {filtersActive && (
            <button type="button" className={styles.clearFiltersBtn} onClick={clearFilters}>
              {t('companies.filters.clear')}
            </button>
          )}
        </div>
      </section>

      {filteredCompanies.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>{t('companies.emptyFilters.title')}</h2>
          <p>{t('companies.emptyFilters.body')}</p>
          <button type="button" className={styles.actionBtn} onClick={clearFilters}>
            {t('companies.filters.clear')}
          </button>
        </div>
      ) : (
        <section className={styles.resultsGrid} aria-label={t('companies.results.label')}>
          {filteredCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              cityName={city.name}
              countryLabel={city.countryCode}
              onView={setSelectedCompany}
            />
          ))}
        </section>
      )}

      <CompaniesBottomNavigation cityId={city.id} />

      <footer className={styles.footerNote}>
        <p>{t('companies.loadMoreFoundation')}</p>
      </footer>

      {selectedCompany && (
        <CompanyDetailsPanel
          company={selectedCompany}
          cityName={city.name}
          countryLabel={city.countryCode}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
}

export function CityCompaniesPage() {
  const { cityId } = useParams<{ cityId: string }>();

  return (
    <CityProvider cityId={cityId ?? null}>
      <CityCompaniesContent />
    </CityProvider>
  );
}
