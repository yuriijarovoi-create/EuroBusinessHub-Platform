import type { PaymentArchitecture } from '@shared/types';
import type { CommissionEngineConfig } from '@shared/types';

export const mockPaymentArchitecture: PaymentArchitecture = {
  subscriptions: [
    { id: 'free', tier: 'free', name: 'Starter', description: 'Für Einsteiger', priceEur: 0, interval: 'month', features: ['Basis-Module', '1 Benutzer'] },
    { id: 'business', tier: 'business', name: 'Business', description: 'Für wachsende Unternehmen', priceEur: 49, interval: 'month', features: ['Alle Module', '5 Benutzer', 'Analytics'] },
    { id: 'enterprise', tier: 'enterprise', name: 'Enterprise', description: 'Für große Organisationen', priceEur: 199, interval: 'month', features: ['Unbegrenzt', 'API', 'Priority Support'] },
    { id: 'premium', tier: 'premium', name: 'Premium', description: 'Company Premium Plan', priceEur: 99, interval: 'month', features: ['Premium Listing', 'KI-Tools', 'Partner-Netzwerk'] },
  ],
  wallets: [],
  transactions: [],
  invoices: [],
  escrow: [],
  dealPayments: [],
  platformFees: [
    { id: 'tx-fee', type: 'transaction', ratePercent: 2.5, module: 'marketplace' },
    { id: 'sub-fee', type: 'subscription', fixedEur: 0, module: 'payments' },
    { id: 'listing-fee', type: 'listing', fixedEur: 5, module: 'marketplace' },
    { id: 'premium-fee', type: 'premium', ratePercent: 1.5 },
  ],
  providers: {
    stripe: { enabled: false },
    paypal: { enabled: false },
    sepa: { enabled: false },
  },
  vat: {
    defaultRate: 19,
    countryRates: { DE: 19, AT: 20, FR: 20, NL: 21, CH: 7.7 },
    reverseChargeEnabled: true,
  },
};

export const mockCommissionConfig: CommissionEngineConfig = {
  rules: [
    { id: 'reg-fee', type: 'registration_fee', name: 'Registrierungsgebühr', description: 'Einmalige Firmenregistrierung', ratePercent: null, fixedEur: 29, active: true },
    { id: 'sub-fee', type: 'subscription_fee', name: 'Abonnementgebühr', description: 'Monatliche Plattformgebühr', ratePercent: null, fixedEur: 49, planTier: 'business', active: true },
    { id: 'tx-fee', type: 'transaction_fee', name: 'Transaktionsgebühr', description: 'Pro Marktplatz-Transaktion', ratePercent: 2.5, fixedEur: null, module: 'marketplace', active: true },
    { id: 'success-fee', type: 'success_fee', name: 'Erfolgsprovision', description: 'Bei abgeschlossenem Deal', ratePercent: 5, fixedEur: null, active: true },
    { id: 'affiliate', type: 'affiliate_commission', name: 'Affiliate-Provision', description: 'Partner-Empfehlung', ratePercent: 10, fixedEur: null, active: true },
    { id: 'referral', type: 'referral_reward', name: 'Empfehlungsbonus', description: 'Neukunden-Empfehlung', ratePercent: null, fixedEur: 25, active: true },
    { id: 'platform', type: 'platform_fee', name: 'Plattformgebühr', description: 'Allgemeine Plattformgebühr', ratePercent: 1.5, fixedEur: null, active: true },
  ],
  affiliatePrograms: [
    { id: 'default', name: 'EuroBusinessHub Partner', commissionRatePercent: 10, cookieDays: 30, minPayoutEur: 50 },
  ],
  premiumPlans: [
    { tier: 'business', monthlyEur: 49, yearlyEur: 470, registrationFeeEur: 0, transactionFeePercent: 2.5, successFeePercent: 5, features: ['Analytics', '5 Benutzer'] },
    { tier: 'enterprise', monthlyEur: 199, yearlyEur: 1900, registrationFeeEur: 0, transactionFeePercent: 1.5, successFeePercent: 3, features: ['API', 'Unbegrenzt'] },
    { tier: 'premium', monthlyEur: 99, yearlyEur: 950, registrationFeeEur: 29, transactionFeePercent: 2, successFeePercent: 4, features: ['Premium Listing', 'KI'] },
  ],
  defaultTransactionFeePercent: 2.5,
  defaultSuccessFeePercent: 5,
};
