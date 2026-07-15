import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { getMapCityById } from '../data/mapData';
import type { MapCityRecord } from '../types/mapTypes';
import {
  getBusinessLayerLabel,
  type ActiveMapContext,
} from '../utils/mapLayerContext';
import { filterCitiesForSearch } from '../utils/citySearchUtils';
import styles from './MapCitySearch.module.css';

function SearchIcon() {
  return (
    <svg
      className={styles.searchIcon}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );
}

function MicrophoneIcon() {
  return (
    <svg
      className={styles.searchIcon}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18.75a6 6 0 0 0 6-6v-4.5a6 6 0 1 0-12 0v4.5a6 6 0 0 0 6 6Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v2.25" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 21.75h7.5"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className={styles.searchIcon}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

export interface MapCitySearchProps {
  selectedCityId: string | null;
  activeMapContext: ActiveMapContext;
  onSelectCity: (city: MapCityRecord, options?: { hasLayerData: boolean }) => void;
  onResetFocus: () => void;
  countryFocusActive?: boolean;
}

export function MapCitySearch({
  selectedCityId,
  activeMapContext,
  onSelectCity,
  onResetFocus,
  countryFocusActive = false,
}: MapCitySearchProps) {
  const { t } = useTranslation('map');
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [layerEmptyMessage, setLayerEmptyMessage] = useState<string | null>(null);
  const [voicePlaceholderMessage, setVoicePlaceholderMessage] = useState<string | null>(null);

  const selectedCity = useMemo(
    () => (selectedCityId ? getMapCityById(selectedCityId) ?? null : null),
    [selectedCityId],
  );

  const activeLayerLabel = activeMapContext.businessLayer
    ? getBusinessLayerLabel(activeMapContext.businessLayer, t)
    : null;

  const results = useMemo(
    () => filterCitiesForSearch(query, activeMapContext.businessLayer),
    [query, activeMapContext.businessLayer],
  );

  const displayLabel = useMemo(() => {
    if (countryFocusActive || !selectedCity) {
      return t('nav.europe');
    }
    return `${selectedCity.name} · ${selectedCity.countryCode}`;
  }, [countryFocusActive, selectedCity, t]);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setActiveIndex(-1);
  }, []);

  const openSearch = useCallback(() => {
    setIsOpen(true);
    setQuery('');
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    if (!layerEmptyMessage) return undefined;
    const timer = window.setTimeout(() => setLayerEmptyMessage(null), 3200);
    return () => window.clearTimeout(timer);
  }, [layerEmptyMessage]);

  useEffect(() => {
    if (!voicePlaceholderMessage) return undefined;
    const timer = window.setTimeout(() => setVoicePlaceholderMessage(null), 2400);
    return () => window.clearTimeout(timer);
  }, [voicePlaceholderMessage]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeSearch();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [closeSearch, isOpen]);

  const handleSelectResult = useCallback(
    (city: MapCityRecord, hasLayerData: boolean) => {
      closeSearch();
      onSelectCity(city, { hasLayerData });
      if (activeMapContext.businessLayer && !hasLayerData) {
        setLayerEmptyMessage(t('search.noLayerData'));
      }
    },
    [activeMapContext.businessLayer, closeSearch, onSelectCity, t],
  );

  const handleDisplayClick = useCallback(() => {
    onResetFocus();
  }, [onResetFocus]);

  const handleVoicePlaceholder = useCallback(() => {
    const message = t('search.voiceComingSoon');
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info('Voice search coming soon');
    }
    setVoicePlaceholderMessage(message);
  }, [t]);

  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeSearch();
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (results.length === 0) return;
        setActiveIndex((current) => (current + 1) % results.length);
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (results.length === 0) return;
        setActiveIndex((current) => (current <= 0 ? results.length - 1 : current - 1));
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        const pick = activeIndex >= 0 ? results[activeIndex] : results[0];
        if (!pick) return;
        handleSelectResult(pick.city, pick.hasActiveLayerData);
      }
    },
    [activeIndex, closeSearch, handleSelectResult, results],
  );

  return (
    <div
      className={`${styles.searchRoot} ${isOpen ? styles.searchRootOpen : styles.searchRootCollapsed}`}
      data-search-open={isOpen ? 'true' : 'false'}
      ref={rootRef}
    >
      {isOpen ? (
        <div className={styles.searchInputWrap} role="combobox" aria-expanded aria-controls={listboxId}>
          <SearchIcon />
          <input
            ref={inputRef}
            id={`${listboxId}-input`}
            className={styles.searchInput}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder={t('search.placeholder')}
            aria-label={t('search.placeholder')}
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-activedescendant={
              activeIndex >= 0 && results[activeIndex]
                ? `${listboxId}-option-${results[activeIndex].city.id}`
                : undefined
            }
            autoComplete="off"
            enterKeyHint="search"
          />
          <button
            type="button"
            className={styles.searchCloseBtn}
            onClick={closeSearch}
            aria-label={t('search.close')}
          >
            <CloseIcon />
          </button>
        </div>
      ) : (
        <div className={styles.searchField}>
          <button
            type="button"
            className={`${styles.searchDisplayBtn} ${styles.citySearchLabel} ${
              selectedCity && !countryFocusActive ? styles.searchDisplayBtnCity : ''
            }`}
            onClick={handleDisplayClick}
          >
            {displayLabel}
          </button>
          <div className={styles.searchIconGroup}>
            <button
              type="button"
              className={styles.searchIconBtn}
              onClick={openSearch}
              aria-label={t('search.open')}
            >
              <SearchIcon />
            </button>
            <button
              type="button"
              className={styles.searchIconBtn}
              onClick={handleVoicePlaceholder}
              aria-label={t('search.voice')}
            >
              <MicrophoneIcon />
            </button>
          </div>
        </div>
      )}

      {isOpen && results.length > 0 ? (
        <ul
          id={listboxId}
          className={styles.searchDropdown}
          role="listbox"
          aria-label={t('search.results')}
        >
          {results.map((result, index) => {
            const metaParts = [result.city.country];
            if (activeLayerLabel && result.hasActiveLayerData) {
              metaParts.push(activeLayerLabel);
            }

            return (
              <li key={result.city.id} role="presentation">
                <button
                  id={`${listboxId}-option-${result.city.id}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`${styles.searchOption} ${
                    index === activeIndex ? styles.searchOptionActive : ''
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => handleSelectResult(result.city, result.hasActiveLayerData)}
                >
                  <span className={styles.searchOptionName}>{result.city.name}</span>
                  <span className={styles.searchOptionMeta}>{metaParts.join(' · ')}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {isOpen && query.trim().length >= 2 && results.length === 0 ? (
        <p className={styles.searchStatus} role="status">
          {t('search.noResults')}
        </p>
      ) : null}

      {!isOpen && layerEmptyMessage ? (
        <p className={styles.searchEmptyLayer} role="status" aria-live="polite">
          {layerEmptyMessage}
        </p>
      ) : null}

      {!isOpen && voicePlaceholderMessage ? (
        <p className={styles.searchVoicePlaceholder} role="status" aria-live="polite">
          {voicePlaceholderMessage}
        </p>
      ) : null}
    </div>
  );
}
