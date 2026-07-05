import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { searchMock, searchIndex } from '@/data/searchResults';
import type { SearchResult } from '@shared/types';
import styles from './GlobalSearch.module.css';

export function GlobalSearch() {
  const { t } = useTranslation('search');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    setResults(searchMock(value));
    setOpen(value.length > 0);
  };

  const handleSelect = (result: SearchResult) => {
    setQuery('');
    setOpen(false);
    navigate(result.route);
  };

  const suggestions = searchIndex.slice(0, 5);
  const displayItems = query ? results : suggestions;

  return (
    <div className={styles.search} ref={containerRef}>
      <label htmlFor="global-search" className={styles.label}>
        {t('aiLabel')}
      </label>
      <div className={styles.inputWrap}>
        <span className={styles.icon} aria-hidden>🔍</span>
        <input
          id="global-search"
          type="search"
          className={styles.input}
          placeholder={t('placeholder')}
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setOpen(true)}
          autoComplete="off"
        />
        <span className={styles.aiBadge}>KI</span>
      </div>

      {open && (
        <ul className={styles.dropdown} role="listbox">
          {!query && displayItems.length > 0 && (
            <li className={styles.sectionLabel}>{t('recent')}</li>
          )}
          {query && results.length === 0 && (
            <li className={styles.empty}>{t('noResults', { query })}</li>
          )}
          {displayItems.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                className={styles.result}
                onClick={() => handleSelect(result)}
                role="option"
              >
                <span className={styles.type}>{t(`types.${result.type}`)}</span>
                <span className={styles.title}>{result.title}</span>
                <span className={styles.subtitle}>{result.subtitle}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
