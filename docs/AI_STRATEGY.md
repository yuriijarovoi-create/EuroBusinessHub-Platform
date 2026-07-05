# EuroBusinessHub — AI Strategy

## Vision

AI is not a feature — it is the operating layer of EuroBusinessHub. Every module, city workspace, and business process is AI-augmented.

## AI surfaces (current & planned)

### 1. Global AI Search

**Status:** UI mock (Phase 0)

Location: `frontend/src/features/search/GlobalSearch.tsx`

- Unified search across cities, modules, businesses, products, jobs
- Mock local filtering via `searchMock()`
- KI badge indicates AI-powered intent

**Target (Phase 4):**

```
User query → Embedding → Vector search (Pinecone/pgvector)
                        → LLM reranking
                        → Structured results by entity type
                        → Context-aware suggestions
```

### 2. Module AI agents

Each module will have specialized agents:

| Module | Agent role |
|--------|-----------|
| Marketplace | Product matching, pricing optimization |
| Transport | Route optimization, carrier matching |
| Logistik | Demand forecasting, warehouse allocation |
| Jobs | Candidate matching, skill gap analysis |
| KI | Agent orchestration, prompt management |
| Akademie | Personalized learning paths |

### 3. City workspace AI

- Local business intelligence for each city
- Activity summaries and trend detection
- Cross-module recommendations

### 4. n8n automation layer

**Status:** Placeholder (Phase 0)

n8n connects AI decisions to business actions:

```
AI Agent decision
    → n8n webhook
    → Business action (email, order, notification)
    → Audit log
```

Planned triggers:

- New marketplace listing → AI categorization → n8n notification
- Transport delay detected → AI reroute suggestion → n8n alert
- Job application received → AI screening → n8n HR workflow

## Architecture (target)

```
┌─────────────────────────────────────────┐
│              Frontend UI                 │
│  Global Search │ Module UIs │ Workspaces │
└──────────┬──────────┬──────────┬───────┘
           │          │          │
┌──────────▼──────────▼──────────▼───────┐
│           AI Gateway Service             │
│  Routing │ Context │ Safety │ Audit      │
└──────────┬──────────┬──────────┬───────┘
           │          │          │
    ┌──────▼──┐ ┌─────▼────┐ ┌──▼──────┐
    │ LLM API │ │ Vector DB│ │ n8n Hub │
    └─────────┘ └──────────┘ └─────────┘
```

## Agent design principles

1. **Scoped context** — Agents only access data within their module/city scope
2. **Human-in-the-loop** — Critical actions require user confirmation
3. **Audit trail** — Every AI action is logged
4. **German-first prompts** — System prompts and responses default to German
5. **Fallback gracefully** — If AI unavailable, show cached/static results

## Data & privacy

- GDPR-compliant AI processing within EU regions
- No training on customer data without consent
- PII redaction before LLM calls
- Data retention policies per agent type

## Implementation phases

| Phase | Deliverable |
|-------|------------|
| 0 | Search UI mock, KI module placeholder |
| 1 | Backend AI gateway scaffold |
| 2 | Semantic search with embeddings |
| 3 | First module agent (Marketplace) |
| 4 | n8n integration + multi-agent orchestration |
| 5 | Custom fine-tuned models for EU business domain |

## Technology candidates

| Component | Options |
|-----------|---------|
| LLM | OpenAI, Anthropic, Mistral (EU-hosted) |
| Embeddings | OpenAI, Cohere, local models |
| Vector DB | pgvector, Pinecone, Weaviate |
| Orchestration | LangChain, custom agent framework |
| Automation | n8n (self-hosted) |

## Mock → Production path

Current mock files and their AI replacements:

| Mock file | Future service |
|-----------|---------------|
| `data/searchResults.ts` | `GET /api/search?q=` + vector search |
| `GlobalSearch.tsx` local filter | AI gateway with streaming results |
| Module placeholders | Per-module agent endpoints |
