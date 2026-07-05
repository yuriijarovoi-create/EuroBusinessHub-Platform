-- EuroBusinessHub core schema (Phase 1 target)
-- PostgreSQL

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users & Auth
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  locale VARCHAR(5) DEFAULT 'de',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  PRIMARY KEY (user_id, role)
);

-- Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  country VARCHAR(2) NOT NULL,
  vat_id VARCHAR(50),
  plan VARCHAR(20) DEFAULT 'free',
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE company_members (
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  PRIMARY KEY (company_id, user_id)
);

-- Cities / Geo
CREATE TABLE cities (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  lat DECIMAL(9,6),
  lng DECIMAL(9,6)
);

-- Module-agnostic listings (marketplace, jobs, etc.)
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module VARCHAR(50) NOT NULL,
  company_id UUID REFERENCES companies(id),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_listings_module ON listings(module);
CREATE INDEX idx_listings_company ON listings(company_id);
