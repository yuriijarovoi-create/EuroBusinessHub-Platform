/** Payment & commission models — re-export from shared + mock data */
export {
  mockPaymentArchitecture,
  mockCommissionConfig,
} from '@/data/payments';

export type {
  PaymentArchitecture,
  SubscriptionPlan,
  Transaction,
  Invoice,
  Wallet,
  EscrowAccount,
  DealPayment,
  PlatformFee,
  CommissionEngineConfig,
  CommissionRule,
  CommissionEntry,
} from '@shared/types';
