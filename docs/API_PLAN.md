# EuroBusinessHub — API Plan

## Base URL

```
/api/v1
```

Configured in `frontend/src/config/app.config.ts` as `apiBaseUrl`.

## Response format

```typescript
interface ApiResponse<T> {
  data: T;
  meta?: { page?: number; total?: number; hasMore?: boolean };
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}
```

## Authentication (Phase 1)

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
GET    /api/v1/auth/me
```

Headers: `Authorization: Bearer <token>`

## Users & Companies

```
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
GET    /api/v1/companies
POST   /api/v1/companies
GET    /api/v1/companies/:id
PATCH  /api/v1/companies/:id
```

## Global Search

```
GET    /api/v1/search?q={query}&type={type}&limit={n}
```

Maps to frontend `SearchResult` type. Mock: `frontend/src/data/searchResults.ts`

## Module endpoints (per module)

Each module follows REST conventions:

```
GET    /api/v1/{module}              List
POST   /api/v1/{module}              Create
GET    /api/v1/{module}/:id          Detail
PATCH  /api/v1/{module}/:id          Update
DELETE /api/v1/{module}/:id          Delete
```

| Module | Prefix |
|--------|--------|
| Marketplace | `/api/v1/marketplace` |
| Transport | `/api/v1/transport` |
| Logistics | `/api/v1/logistics` |
| Warehouses | `/api/v1/warehouses` |
| Companies | `/api/v1/companies` |
| Jobs | `/api/v1/jobs` |
| Partners | `/api/v1/partners` |
| Digital Products | `/api/v1/digital-products` |
| Academy | `/api/v1/academy` |
| AI | `/api/v1/ai` |

## Cities & Workspaces

```
GET    /api/v1/cities
GET    /api/v1/cities/:id
GET    /api/v1/cities/:id/stats
GET    /api/v1/cities/:id/modules
```

Mock: `frontend/src/data/cities.ts`

## AI Assistant

```
POST   /api/v1/ai/chat
POST   /api/v1/ai/search
GET    /api/v1/ai/suggestions
```

## Payments (Phase 5)

```
GET    /api/v1/payments/plans
POST   /api/v1/payments/subscribe
POST   /api/v1/payments/webhook   (Stripe)
```

## Notifications

```
GET    /api/v1/notifications
PATCH  /api/v1/notifications/:id/read
```

## Mock → API migration

Every file in `frontend/src/data/` has a corresponding API endpoint above. Frontend will swap mock imports for API hooks without changing component interfaces.
