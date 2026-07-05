# EuroBusinessHub — Product Roadmap

## Phase 0 — Foundation ✅ (current)

- [x] Monorepo structure (`frontend/`, `backend/`, `database/`, `docs/`, `shared/`)
- [x] React + Vite + TypeScript frontend
- [x] German-first i18n (DE + EN)
- [x] Interactive Europe business map (mock cities)
- [x] City workspaces
- [x] Global AI search UI (mock results)
- [x] 10 business modules with routes
- [x] Mobile-first responsive layout
- [x] Architecture documentation

## Phase 1 — Core Platform

- [ ] User authentication (email, OAuth)
- [ ] Organization & team management
- [ ] Role-based access control (RBAC)
- [ ] Backend API scaffold (Node/Bun)
- [ ] PostgreSQL schema & migrations
- [ ] Replace mock data with API layer

## Phase 2 — Map & Workspaces

- [ ] Real geospatial map (MapLibre / Leaflet)
- [ ] Live city data feeds
- [ ] City workspace dashboards with real metrics
- [ ] Cross-city business networking
- [ ] Map-based analytics

## Phase 3 — Business Modules

Each module gets full CRUD + workflows:

| Module | Priority | Key features |
|--------|----------|--------------|
| Marketplace | P0 | Listings, orders, B2B matching |
| Transport | P0 | Freight booking, tracking |
| Logistik | P0 | Fulfillment, routing |
| Unternehmen | P1 | Company profiles, KYC |
| Jobs | P1 | Postings, applications |
| Lager | P2 | Inventory management |
| Partner | P1 | Partner network graph |
| Digitale Produkte | P2 | Digital goods, licensing |
| Akademie | P2 | Courses, certifications |
| KI | P0 | AI tools hub |

## Phase 4 — AI & Automation

- [ ] AI agent framework (per-module agents)
- [ ] Global semantic search (vector DB)
- [ ] n8n workflow integration
- [ ] Automated business processes
- [ ] AI-generated insights & reports

## Phase 5 — Commerce

- [ ] Payment processing (Stripe)
- [ ] Subscription billing
- [ ] Invoicing & accounting hooks
- [ ] Multi-currency (EUR-first)

## Phase 6 — Scale

- [ ] Multi-tenant architecture
- [ ] EU compliance (GDPR, eIDAS)
- [ ] Performance optimization
- [ ] Mobile apps (React Native)
- [ ] Public API & developer portal

## Principles

1. **German-first** — UI, content, and defaults target DACH/EU business users
2. **Mock → API** — Every mock data file maps to a future API endpoint
3. **Module isolation** — Modules are independently deployable
4. **AI-native** — AI is embedded, not bolted on
