import type { AiArchitecture } from '@shared/types';

export const aiCapabilities: AiArchitecture = {
  capabilities: [
    { id: 'assistant', name: 'KI-Assistent', description: 'Conversational business assistant', status: 'beta', module: 'ki', apiEndpoint: '/api/v1/ai/chat' },
    { id: 'recommendations', name: 'Empfehlungen', description: 'Personalized business recommendations', status: 'planned', apiEndpoint: '/api/v1/ai/recommendations' },
    { id: 'smart_search', name: 'Smart Search', description: 'Semantic cross-module search', status: 'beta', module: 'ki', apiEndpoint: '/api/v1/ai/search' },
    { id: 'business_matching', name: 'Business Matching', description: 'B2B partnership matching', status: 'planned', module: 'partner', apiEndpoint: '/api/v1/ai/match/business' },
    { id: 'transport_matching', name: 'Transport Matching', description: 'Freight capacity matching', status: 'planned', module: 'transport', apiEndpoint: '/api/v1/ai/match/transport' },
    { id: 'lead_scoring', name: 'Lead Scoring', description: 'Sales lead prioritization', status: 'planned', apiEndpoint: '/api/v1/ai/leads/score' },
    { id: 'company_ranking', name: 'Company Ranking', description: 'Trust and activity ranking', status: 'planned', module: 'unternehmen', apiEndpoint: '/api/v1/ai/rank/companies' },
    { id: 'fraud_detection', name: 'Fraud Detection', description: 'Transaction and identity fraud signals', status: 'planned', apiEndpoint: '/api/v1/ai/fraud/detect' },
  ],
  defaultModel: 'gpt-4o',
  embeddingModel: 'text-embedding-3-small',
  vectorStore: 'pgvector',
};
