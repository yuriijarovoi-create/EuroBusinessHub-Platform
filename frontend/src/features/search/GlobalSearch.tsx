import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { searchMock, searchIndex } from '@/data/searchResults';
import type { SearchResult } from '@shared/types';
import styles from './GlobalSearch.module.css';

interface GlobalSearchProps {
  variant?: 'default' | 'hero' | 'header';
}

export function GlobalSearch({ variant = 'default' }: GlobalSearchProps) {
  const { t } = useTranslation(['search', 'modules']);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const isHeader = variant === 'header';
  const isHero = variant === 'hero';

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
    setOpen(true);
  };

  const handleSelect = (result: SearchResult) => {
    setQuery('');
    setOpen(false);
    navigate(result.route);
  };

  const suggestions = searchIndex.slice(0, 6);
  const displayItems = query ? results : suggestions;

  const resolveTitle = (result: SearchResult) => {
    if (result.type === 'module' && result.module) {
      return t(`modules:${result.module}.name`, { defaultValue: result.title });
    }
    return result.title;
  };

  return (
    <div
      className={`${styles.search} ${isHero ? styles.hero : ''} ${isHeader ? styles.header : ''}`}
      ref={containerRef}
    >
      {!isHeader && (
        <label htmlFor="global-search" className={styles.label}>
          {t('search:aiLabel')}
        </label>
      )}
      <div className={styles.inputWrap}>
        <span className={styles.icon} aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </span>
        <input
          id="global-search"
          type="search"
          className={styles.input}
          placeholder={t('search:placeholder')}
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
            <li className={styles.sectionLabel}>{t('search:recent')}</li>
          )}
          {query && results.length === 0 && (
            <li className={styles.empty}>{t('search:noResults', { query })}</li>
          )}
          {displayItems.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                className={styles.result}
                onClick={() => handleSelect(result)}
                role="option"
              >
                <span className={styles.type}>{t(`search:types.${result.type}`)}</span>
                <span className={styles.title}>{resolveTitle(result)}</span>
                <span className={styles.subtitle}>{result.subtitle}</span>
                {result.score !== undefined && (
                  <span className={styles.score}>{Math.round(result.score * 100)}%</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
