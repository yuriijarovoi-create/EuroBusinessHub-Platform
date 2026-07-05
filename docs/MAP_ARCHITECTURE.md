# EuroBusinessHub — Map Architecture

## Overview

The Europe business map is the primary navigation surface of EuroBusinessHub. Users explore active business hubs by city and open city-specific workspaces.

## Current implementation (Phase 0)

### Component: `EuropeMap`

Location: `frontend/src/features/map/EuropeMap.tsx`

- SVG-based simplified Europe landmass
- Clickable city markers positioned via `mapX` / `mapY` percentages
- 12 mock cities across DACH, Benelux, France, CEE, Nordics
- Navigates to `/workspace/:cityId` on click

### City data model

```typescript
interface City {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  lat: number;       // Real coordinates (future map lib)
  lng: number;
  mapX: number;      // SVG position (%)
  mapY: number;
  businesses: number;
  activeModules: ModuleId[];
}
```

Mock data: `frontend/src/data/cities.ts`

## Interaction model

```
User taps city marker
    → Navigate to /workspace/:cityId
    → City workspace loads with:
        - Stats (mock)
        - Active modules for that city
        - Quick actions
```

## Target architecture (Phase 2+)

### Map engine

| Option | Pros | Cons |
|--------|------|------|
| MapLibre GL JS | Vector tiles, performant | Heavier bundle |
| Leaflet | Simple, proven | Less modern |
| Custom SVG (current) | Zero deps, fast | Limited at scale |

**Recommendation:** Migrate to MapLibre when real geodata is needed.

### Data layers

```
Base map tiles
  └── City markers (clustered at low zoom)
        └── City detail popup
              └── Workspace link
  └── Business density heatmap (future)
  └── Transport routes overlay (future)
  └── Live activity pulses (future)
```

### API endpoints (planned)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/cities` | List all active cities |
| `GET /api/cities/:id` | City detail + stats |
| `GET /api/cities/:id/modules` | Active modules |
| `GET /api/cities/:id/activity` | Live activity feed |

### Real-time updates

- WebSocket channel per city workspace
- Server-sent events for map activity indicators
- n8n triggers for business events → map updates

## Coordinate strategy

1. **Phase 0:** Percentage-based SVG positioning (`mapX`, `mapY`)
2. **Phase 2:** Real `lat`/`lng` with map library projection
3. **Phase 3:** GeoJSON boundaries, custom tile styling

## Accessibility

- City markers are keyboard-focusable (`tabIndex`, Enter/Space)
- ARIA labels with city name and business count
- High-contrast marker states (default, hover, selected)

## Performance considerations

- Lazy-load map library when migrating from SVG
- Cluster markers when city count exceeds 50
- Virtualize city list sidebar on mobile
- Cache city data with stale-while-revalidate

## Mobile-first behavior

- Full-width map on mobile
- Touch-friendly marker hit areas (min 44px)
- Bottom sheet for city preview (future)
- Swipe between nearby cities (future)
