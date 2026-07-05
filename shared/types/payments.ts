/** Payment architecture — no provider integration yet */

export type PaymentProvider = 'stripe' | 'paypal' | 'sepa' | 'internal';

export type PaymentMethodType = 'card' | 'sepa_debit' | 'paypal' | 'wallet';

export type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

export type EscrowStatus = 'held' | 'released' | 'disputed' | 'refunded';

export type SubscriptionPlanTier = 'free' | 'business' | 'enterprise' | 'premium';

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionPlanTier;
  name: string;
  description: string;
  priceEur: number;
  interval: 'month' | 'year';
  features: string[];
  /** Future Stripe Price ID */
  stripePriceId?: string;
}

export interface Transaction {
  id: string;
  amountEur: number;
  currency: 'EUR';
  status: TransactionStatus;
  type: 'subscription' | 'deal' | 'fee' | 'escrow' | 'payout' | 'refund';
  provider: PaymentProvider | null;
  providerRef?: string;
  companyId?: string;
  userId?: string;
  description: string;
  vatRate?: number;
  vatAmountEur?: number;
  createdAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  companyId: string;
  status: InvoiceStatus;
  amountEur: number;
  vatAmountEur: number;
  totalEur: number;
  dueDate: string;
  paidAt?: string;
  lineItems: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceEur: number;
  vatRate: number;
}

export interface Wallet {
  id: string;
  userId: string;
  balanceEur: number;
  pendingEur: number;
  currency: 'EUR';
  updatedAt: string;
}

export interface EscrowAccount {
  id: string;
  dealId: string;
  amountEur: number;
  status: EscrowStatus;
  buyerId: string;
  sellerId: string;
  releaseConditions: string;
  createdAt: string;
}

export interface DealPayment {
  id: string;
  dealId: string;
  amountEur: number;
  escrowId?: string;
  status: TransactionStatus;
  milestones: DealPaymentMilestone[];
}

export interface DealPaymentMilestone {
  id: string;
  label: string;
  amountEur: number;
  status: 'pending' | 'released';
}

export interface PlatformFee {
  id: string;
  type: 'transaction' | 'subscription' | 'listing' | 'premium';
  ratePercent?: number;
  fixedEur?: number;
  module?: string;
}

/** Future provider integration contracts */
export interface StripeIntegrationConfig {
  enabled: boolean;
  publishableKey?: string;
  webhookSecret?: string;
}

export interface PayPalIntegrationConfig {
  enabled: boolean;
  clientId?: string;
}

export interface SepaIntegrationConfig {
  enabled: boolean;
  creditorId?: string;
}

export interface VatConfig {
  defaultRate: number;
  countryRates: Record<string, number>;
  reverseChargeEnabled: boolean;
}

export interface PaymentArchitecture {
  subscriptions: SubscriptionPlan[];
  wallets: Wallet[];
  transactions: Transaction[];
  invoices: Invoice[];
  escrow: EscrowAccount[];
  dealPayments: DealPayment[];
  platformFees: PlatformFee[];
  providers: {
    stripe: StripeIntegrationConfig;
    paypal: PayPalIntegrationConfig;
    sepa: SepaIntegrationConfig;
  };
  vat: VatConfig;
}
