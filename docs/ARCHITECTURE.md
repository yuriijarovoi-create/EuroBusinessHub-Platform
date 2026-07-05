# EuroBusinessHub — System Architecture

## Vision

EuroBusinessHub is an **AI Business Operating System for Europe** — not a marketing website. It orchestrates business operations across cities, modules, and AI agents through a unified platform.

## Monorepo Structure

```
EuroBusinessHub/
├── frontend/     React SPA (Vite + TypeScript)
├── backend/      Future API services
├── database/     Schema, migrations, seeds
├── shared/       Cross-package types & contracts
└── docs/         Architecture & product docs
```

## Frontend Architecture

### Layer model

| Layer | Location | Responsibility |
|-------|----------|----------------|
| App shell | `src/app/` | Routing, providers |
| Features | `src/features/` | Domain UI (map, search, workspace, modules) |
| Shared UI | `src/shared/` | Layout, reusable components |
| Data | `src/data/` | Mock data (temporary) |
| i18n | `src/i18n/` | Translations (German-first) |
| Styles | `src/styles/` | Design tokens, globals |

### Module system

Each business module (Marketplace, Transport, Logistik, etc.) has:

- A route: `/module/:moduleId`
- Shared type definition in `shared/types/`
- i18n namespace keys in `modules.json`
- Future backend service alignment

### Routing

| Route | Page |
|-------|------|
| `/` | Home (map + search + modules) |
| `/modules` | All modules overview |
| `/module/:moduleId` | Module workspace placeholder |
| `/workspace/:cityId` | City business workspace |

## Future Backend (planned)

```
backend/
├── auth/           Authentication & RBAC
├── payments/       Stripe/similar integration
├── agents/         AI agent orchestration
├── automation/     n8n webhook receivers
└── modules/        Per-module API services
```

## Data flow (target state)

```
User → Frontend → API Gateway → Module Services → Database
                      ↓
                 AI Agent Layer → n8n Workflows
```

## Current state

- **Mock data only** — no external APIs
- **German-first UI** with scalable i18n
- **Mobile-first** responsive layout
- Placeholders for auth, payments, AI agents, n8n

## Technology choices

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Frontend | React 19 + Vite | Fast DX, ecosystem |
| Language | TypeScript | Type safety across monorepo |
| Routing | React Router 7 | Standard SPA routing |
| i18n | i18next | Namespace-based scaling |
| Styling | CSS Modules + tokens | No runtime overhead |

## Shared contracts

Types in `shared/types/` are the source of truth for:

- `ModuleId`, `City`, `SearchResult`, `BusinessModule`
- Future: API request/response shapes, validation schemas

Both frontend and backend will import from `shared/` when connected.
