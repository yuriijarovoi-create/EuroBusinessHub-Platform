# EuroBusinessHub — Design System

## Principles

1. **Mobile-first** — Design for smallest screen, enhance upward
2. **German business aesthetic** — Professional, trustworthy, efficient
3. **Clarity over decoration** — Information density for business users
4. **Accessible by default** — WCAG 2.1 AA target

## Color palette

Defined in `frontend/src/styles/tokens.css`

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#1a3a6b` | Brand, navigation, headings |
| `--color-primary-light` | `#2d5aa0` | Links, interactive states |
| `--color-accent` | `#e8a838` | CTAs, map markers (active) |
| `--color-bg` | `#f4f6f9` | Page background |
| `--color-surface` | `#ffffff` | Cards, panels |
| `--color-text` | `#1e293b` | Primary text |
| `--color-text-secondary` | `#64748b` | Supporting text |

Status colors: success (`#059669`), warning (`#d97706`), error (`#dc2626`), info (`#0284c7`)

Dark mode: Automatic via `prefers-color-scheme: dark` media query.

## Typography

| Token | Size | Usage |
|-------|------|-------|
| `--font-size-xs` | 0.75rem | Badges, labels |
| `--font-size-sm` | 0.875rem | Secondary text, nav |
| `--font-size-base` | 1rem | Body text |
| `--font-size-lg` | 1.125rem | Subheadings |
| `--font-size-xl` | 1.25rem | Section titles |
| `--font-size-2xl` | 1.5rem | Page titles (mobile) |
| `--font-size-3xl` | 1.875rem | Hero titles (desktop) |

Font stack: `'Segoe UI', system-ui, -apple-system, sans-serif`

## Spacing scale

```
xs: 0.25rem  │  sm: 0.5rem  │  md: 1rem
lg: 1.5rem   │  xl: 2rem    │  2xl: 3rem
```

## Layout

| Token | Value | Usage |
|-------|-------|-------|
| `--header-height` | 3.5rem | Fixed header |
| `--sidebar-width` | 16rem | Module navigation |
| `--max-content-width` | 80rem | Content container |

### Breakpoints

| Name | Min-width | Layout changes |
|------|-----------|----------------|
| Mobile | 0 | Single column, hamburger menu |
| Tablet | 640px | 2-column grids |
| Desktop | 768px | Horizontal nav visible |
| Wide | 1024px | Persistent sidebar |
| XL | 1280px | 4-column module grid |

## Components

### Layout

- `AppShell` — Main layout wrapper
- `Header` — Sticky top bar with brand, nav, language toggle
- `Sidebar` — Module navigation (drawer on mobile, persistent on desktop)
- `Footer` — Copyright and status

### Features

- `EuropeMap` — SVG map with city markers
- `GlobalSearch` — AI search bar with dropdown results
- `ModuleGrid` — Responsive module card grid
- `ModulePage` — Individual module workspace placeholder
- `CityWorkspacePage` — City-specific dashboard

### Styling approach

- **CSS Modules** for component styles (`.module.css`)
- **Design tokens** in `tokens.css` (CSS custom properties)
- **Global resets** in `global.css`
- No CSS-in-JS runtime

## Module status badges

| Status | Color | Meaning |
|--------|-------|---------|
| Active | Green | Fully available |
| Beta | Blue | Available with limitations |
| Coming soon | Amber | Planned, not yet available |

## Iconography

Currently emoji icons for module identification (Phase 0). Future: consistent SVG icon set.

## Interaction patterns

- **Cards** — Border + hover shadow for clickable items
- **Buttons** — Rounded corners, clear disabled states
- **Search** — Focus ring via border-color change
- **Map markers** — Scale and color change on hover/select

## i18n considerations

- German text tends to be longer — layouts use flexible widths
- No fixed-width buttons for translated labels
- Date/number formatting via i18next (future)

## Future additions

- [ ] Component library documentation (Storybook)
- [ ] SVG icon system
- [ ] Animation tokens
- [ ] Form component patterns
- [ ] Data table components
- [ ] Toast/notification system
