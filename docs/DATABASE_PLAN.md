# EuroBusinessHub — Database Plan

## Database

**Target**: PostgreSQL 16+

## Schema location

```
database/
├── schema/       Initial DDL
├── seeds/        Development seed data
└── migrations/   Version-controlled migrations (Phase 1)
```

## Core entities

### Identity
- `users` — Platform users
- `user_roles` — RBAC role assignments
- `companies` — Business entities
- `company_members` — User ↔ company relationships

### Geo
- `cities` — European business hubs (maps to frontend mock cities)

### Content
- `listings` — Module-agnostic listings (marketplace products, jobs, services)

## Phase 1 additions

- `sessions` / `refresh_tokens` — Auth
- `subscriptions` / `invoices` — Payments
- `messages` / `threads` — Messaging
- `notifications` — Alert queue
- `reviews` — Ratings
- Module-specific tables per domain

## Conventions

- UUIDs for primary keys
- `created_at` / `updated_at` on all tables
- Soft deletes via `deleted_at` where applicable
- JSONB for flexible module metadata

## ORM (planned)

Evaluate Drizzle ORM or Prisma in Phase 1 for type-safe migrations aligned with `shared/types/`.

## Seed strategy

Seeds mirror frontend mock data in `frontend/src/data/` so dev environment matches UI demos.

See `database/schema/001_core.sql` for initial DDL.
