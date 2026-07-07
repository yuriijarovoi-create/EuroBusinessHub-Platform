/** Commission & monetization architecture — no real billing logic yet */

export type CommissionType =
  | 'registration_fee'
  | 'subscription_fee'
  | 'transaction_fee'
  | 'success_fee'
  | 'affiliate_commission'
  | 'referral_reward'
  | 'platform_fee';

export type CommissionStatus = 'pending' | 'calculated' | 'paid' | 'cancelled';

export interface CommissionRule {
  id: string;
  type: CommissionType;
  name: string;
  description: string;
  /** Percentage (0–100) or null if fixed */
  ratePercent: number | null;
  /** Fixed EUR amount or null if percentage */
  fixedEur: number | null;
  module?: string;
  planTier?: 'free' | 'business' | 'enterprise' | 'premium';
  active: boolean;
}

export interface CommissionEntry {
  id: string;
  ruleId: string;
  type: CommissionType;
  amountEur: number;
  status: CommissionStatus;
  sourceTransactionId?: string;
  beneficiaryId: string;
  beneficiaryType: 'platform' | 'affiliate' | 'referrer' | 'partner';
  createdAt: string;
}

export interface AffiliateProgram {
  id: string;
  name: string;
  commissionRatePercent: number;
  cookieDays: number;
  minPayoutEur: number;
}

export interface ReferralReward {
  id: string;
  referrerId: string;
  referredId: string;
  rewardEur: number;
  status: 'pending' | 'granted' | 'expired';
  createdAt: string;
}

export interface PremiumPlanPricing {
  tier: 'business' | 'enterprise' | 'premium';
  monthlyEur: number;
  yearlyEur: number;
  registrationFeeEur: number;
  transactionFeePercent: number;
  successFeePercent: number;
  features: string[];
}

export interface CommissionEngineConfig {
  rules: CommissionRule[];
  affiliatePrograms: AffiliateProgram[];
  premiumPlans: PremiumPlanPricing[];
  defaultTransactionFeePercent: number;
  defaultSuccessFeePercent: number;
}
