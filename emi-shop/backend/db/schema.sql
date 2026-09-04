-- Schema for the EMI shop app
-- One product (e.g. "iPhone 17 Pro") can have many variants (storage/color combos),
-- and each variant carries its own price + its own set of EMI plans, since the
-- monthly payment depends on the price of that specific variant.

DROP TABLE IF EXISTS emi_plans;
DROP TABLE IF EXISTS variants;
DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,       -- used in the URL, e.g. iphone-17-pro
  name        TEXT NOT NULL,              -- e.g. "iPhone 17 Pro"
  brand       TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'smartphone',
  description TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE variants (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id   INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  storage      TEXT,                      -- e.g. "256GB" (nullable, not every product has storage tiers)
  color        TEXT NOT NULL,             -- e.g. "Cosmic Orange"
  color_hex    TEXT,                      -- for rendering the little color swatch
  mrp          INTEGER NOT NULL,          -- in rupees, paise not needed for this use case
  price        INTEGER NOT NULL,          -- selling price, <= mrp
  image_url    TEXT,
  in_stock     INTEGER NOT NULL DEFAULT 1,
  is_default   INTEGER NOT NULL DEFAULT 0 -- which variant loads first on the product page
);

CREATE TABLE emi_plans (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  variant_id       INTEGER NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  tenure_months    INTEGER NOT NULL,
  monthly_amount   INTEGER NOT NULL,
  interest_rate    REAL NOT NULL DEFAULT 0,   -- 0 = zero-cost EMI
  cashback_amount  INTEGER NOT NULL DEFAULT 0,
  fund_partner     TEXT DEFAULT 'Mutual Fund SIP'  -- which MF product backs this plan
);

CREATE INDEX idx_variants_product ON variants(product_id);
CREATE INDEX idx_emi_variant ON emi_plans(variant_id);
