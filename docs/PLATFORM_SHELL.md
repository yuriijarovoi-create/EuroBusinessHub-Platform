# EuroBusinessHub — Platform Shell

## Phase 2 — Premium Homepage (current)

Enterprise-grade homepage comparable to Apple, Stripe, Linear, and Google Cloud quality.

## Homepage composition

The homepage is built entirely from **reusable components** — no inline layout logic in `HomePage.tsx`.

```
pages/HomePage.tsx
  └── components/home/
        ├── PremiumHero           Centered hero, large search, CTAs
        ├── HomeMapSection        Full-width Europe map
        ├── HomeStatsSection      Animated platform statistics
        ├── HomeDashboardSection  Glass dashboard KPI cards
        └── HomeModulesSection    Premium module cards
```

## Reusable component library

### Layout
| Component | Location |
|-----------|----------|
| `FullBleedSection` | `components/FullBleedSection` |
| `GlassPanel` | `components/GlassPanel` |
| `SectionHeader` | `components/SectionHeader` |

### Homepage sections
| Component | Location |
|-----------|----------|
| `PremiumHero` | `components/home/PremiumHero` |
| `HomeMapSection` | `components/home/HomeMapSection` |
| `HomeStatsSection` | `components/home/HomeStatsSection` |
| `HomeDashboardSection` | `components/home/HomeDashboardSection` |
| `HomeModulesSection` | `components/home/HomeModulesSection` |

### Data display
| Component | Location |
|-----------|----------|
| `AnimatedCounter` | `components/AnimatedCounter` |
| `PlatformStats` | `components/PlatformStats` |
| `MetricCard` | `components/MetricCard` |
| `DashboardMetrics` | `components/DashboardMetrics` |
| `ModuleCard` | `components/ModuleCard` |

### Map module
See `docs/MAP_ARCHITECTURE.md` — standalone module at `features/map/`.

## Design principles (Phase 2)

- **Glassmorphism** — frosted panels, soft borders, depth via blur
- **Large spacing** — generous vertical rhythm between sections
- **Smooth animations** — fade-in-up, hover lifts, counter easing
- **Dark/Light themes** — via `data-theme` + system preference
- **Responsive** — mobile-first, full-bleed map, adaptive grids
- **Clean typography** — Inter, tight letter-spacing on headlines

## Full-bleed map

The Europe map breaks out of the content container using `FullBleedSection`:

```css
width: 100vw;
margin-left: calc(50% - 50vw);
```

This creates the immersive "operating system" first impression.

## Data flow (mock)

```
countries.ts ──→ MapCountryLayer
cities.ts ─────→ MapCityNode
mapNavigation.ts → CityWorkspace (future workspace pages)
platformStats.ts → PlatformStats, DashboardMetrics
modules.ts ────→ ModuleCard, HomeModulesSection
```

## Shell components (Phase 1, unchanged)

- Header: logo, search, language, theme, notifications, user menu
- Sidebar: 15 modules with active state
- Footer: minimal status

See Phase 1 details in previous sections of this document.
