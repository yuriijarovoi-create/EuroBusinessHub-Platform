# EuroBusinessHub — Modules

## Overview

EuroBusinessHub organizes business capabilities into **modules** — independently deployable domains connected by global search, AI, and shared user/company accounts.

## Sidebar modules (Phase 1 — 15 total)

| Order | Module ID | Name (DE) | Route | Status |
|-------|-----------|-----------|-------|--------|
| 0 | `dashboard` | Dashboard | `/dashboard` | Active |
| 1 | `marketplace` | Marketplace | `/module/marketplace` | Active |
| 2 | `transport` | Transport Exchange | `/module/transport` | Active |
| 3 | `logistik` | Logistics | `/module/logistik` | Active |
| 4 | `lager` | Warehouses | `/module/lager` | Beta |
| 5 | `unternehmen` | Companies | `/module/unternehmen` | Active |
| 6 | `jobs` | Jobs | `/module/jobs` | Active |
| 7 | `services` | Business Services | `/module/services` | Beta |
| 8 | `partner` | Partners | `/module/partner` | Active |
| 9 | `digitale-produkte` | Digital Products | `/module/digitale-produkte` | Beta |
| 10 | `akademie` | Academy | `/module/akademie` | Active |
| 11 | `ki` | AI Assistant | `/module/ki` | Active |
| 12 | `analytics` | Analytics | `/module/analytics` | Beta |
| 13 | `payments` | Payments | `/module/payments` | Beta |
| 14 | `admin` | Administration | `/admin` | Coming soon |

Source of truth: `frontend/src/data/modules.ts` → `platformModules`

Homepage shows 10 modules (`showOnHomepage: true`).

## Cross-cutting features

| Feature | Folder | Phase 1 status |
|---------|--------|----------------|
| Auth | `features/auth/` | Placeholder |
| Search | `features/search/` | Global AI search UI |
| Payments | `features/payments/` | Architecture + types |
| AI | `features/ai/` | 8 capability placeholders |
| Notifications | `features/notifications/` | Mock panel in header |
| Messaging | `features/messaging/` | Placeholder |
| Reviews | `features/reviews/` | Placeholder |
| Analytics | `features/analytics/` | Placeholder |
| Map | `features/map/` | SVG architecture |

## Module folder structure

```
modules/{name}/
  index.ts          Module ID constant
  (future)
  components/       Module-specific UI
  hooks/            Data hooks
  api/              API client
```

Registry: `modules/index.ts` — API prefixes and role mappings.

## Payment module (architecture only)

See `docs/PAYMENTS_ARCHITECTURE.md`:
- Subscriptions, transactions, invoices, wallet, escrow
- Commission engine (7 fee types)
- Future Stripe, PayPal, SEPA integration
- VAT handling for EU

## AI module (architecture only)

See `docs/AI_STRATEGY.md` and `shared/types/ai.ts`:
- Assistant, recommendations, smart search
- Business/transport matching
- Lead scoring, company ranking, fraud detection

## Integration pattern

Modules connect via:
1. **Global Search** — unified index (`data/searchResults.ts`)
2. **Sidebar navigation** — `platformModules` with routes
3. **Shared types** — `shared/types/ModuleId`
4. **AI layer** — cross-module recommendations (future)
5. **Payment layer** — unified billing (future)
