# EuroBusinessHub — Payments Architecture

## Status

**Phase 1 — Architecture only.** No payment providers integrated.

## Domain models

Located in `shared/types/payments.ts`:

| Model | Purpose |
|-------|---------|
| `SubscriptionPlan` | Tiered plans (free, business, enterprise, premium) |
| `Transaction` | All money movements |
| `Invoice` | B2B invoicing with VAT line items |
| `Wallet` | User/platform balance |
| `EscrowAccount` | Deal-held funds |
| `DealPayment` | Milestone-based deal payments |
| `PlatformFee` | Configurable fee rules |

## Commission engine

Located in `shared/types/commissions.ts`:

| Commission type | Description |
|-----------------|-------------|
| `registration_fee` | One-time company registration |
| `subscription_fee` | Monthly/yearly plan fee |
| `transaction_fee` | Per marketplace transaction (default 2.5%) |
| `success_fee` | Completed deal commission (default 5%) |
| `affiliate_commission` | Partner referral (default 10%) |
| `referral_reward` | User referral bonus (€25) |
| `platform_fee` | General platform fee (1.5%) |

## Premium plans

| Tier | Monthly | Transaction fee | Success fee |
|------|---------|-----------------|-------------|
| Business | €49 | 2.5% | 5% |
| Enterprise | €199 | 1.5% | 3% |
| Premium | €99 | 2% | 4% |

## Future provider integration

```
Frontend → /api/v1/payments → Payment Service
                                  ├── Stripe (cards, subscriptions)
                                  ├── PayPal (international)
                                  └── SEPA (EU bank transfers)
```

### Stripe (Phase 5)
- Checkout Sessions for subscriptions
- Connect for marketplace seller payouts
- Webhooks at `/api/v1/payments/webhook/stripe`

### PayPal (Phase 5)
- PayPal Checkout for international buyers
- Webhooks at `/api/v1/payments/webhook/paypal`

### SEPA (Phase 5)
- Direct debit for EU B2B
- Creditor ID registration required

## VAT handling

Configured in `PaymentArchitecture.vat`:
- Default DE rate: 19%
- Country-specific rates (AT, FR, NL, CH)
- Reverse charge for B2B cross-border EU

## Mock data

`frontend/src/data/payments.ts` — development fixtures aligned with shared types.

## Module integration

- Frontend: `features/payments/`
- Backend: `backend/src/payments/`
- Module route: `/module/payments`
