/** AI capability architecture — placeholders for future integration */

export type AiCapabilityId =
  | 'assistant'
  | 'recommendations'
  | 'smart_search'
  | 'business_matching'
  | 'transport_matching'
  | 'lead_scoring'
  | 'company_ranking'
  | 'fraud_detection';

export type AiCapabilityStatus = 'planned' | 'beta' | 'active';

export interface AiCapability {
  id: AiCapabilityId;
  name: string;
  description: string;
  status: AiCapabilityStatus;
  module?: string;
  apiEndpoint?: string;
}

export interface AiRecommendation {
  id: string;
  type: 'company' | 'transport' | 'product' | 'job' | 'partner';
  title: string;
  score: number;
  reason: string;
  targetRoute: string;
}

export interface SmartSearchQuery {
  query: string;
  modules: string[];
  intent?: string;
  filters?: Record<string, string>;
}

export interface BusinessMatch {
  id: string;
  companyAId: string;
  companyBId: string;
  matchScore: number;
  factors: string[];
}

export interface TransportMatch {
  id: string;
  originCityId: string;
  destinationCityId: string;
  providerId: string;
  matchScore: number;
}

export interface LeadScore {
  leadId: string;
  score: number;
  tier: 'cold' | 'warm' | 'hot';
  signals: string[];
}

export interface CompanyRanking {
  companyId: string;
  rank: number;
  score: number;
  category: string;
}

export interface FraudSignal {
  id: string;
  entityId: string;
  entityType: 'user' | 'company' | 'transaction';
  severity: 'low' | 'medium' | 'high';
  signal: string;
  detectedAt: string;
}

export interface AiArchitecture {
  capabilities: AiCapability[];
  defaultModel?: string;
  embeddingModel?: string;
  vectorStore?: string;
}
