const { db, initSchema } = require('./database');

// Standard reducing-balance EMI formula. For rate = 0 it just falls back to price / tenure.
function calcMonthlyEmi(principal, tenureMonths, annualRatePercent) {
  if (annualRatePercent === 0) {
    return Math.round(principal / tenureMonths);
  }
  const r = annualRatePercent / 12 / 100;
  const emi = (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
  return Math.round(emi);
}

// Same tenure ladder for every variant: short tenures are interest-free, longer ones carry
// interest, and a flat cashback (funded by the partner mutual fund scheme) is applied throughout.
const TENURE_PLAN = [
  { tenure: 3, rate: 0 },
  { tenure: 6, rate: 0 },
  { tenure: 12, rate: 0 },
  { tenure: 24, rate: 0 },
  { tenure: 36, rate: 10.5 },
  { tenure: 48, rate: 10.5 },
  { tenure: 60, rate: 10.5 },
];

function buildEmiPlans(price, cashback) {
  return TENURE_PLAN.map(({ tenure, rate }) => ({
    tenure_months: tenure,
    monthly_amount: calcMonthlyEmi(price, tenure, rate),
    interest_rate: rate,
    cashback_amount: cashback,
    fund_partner: rate === 0 ? 'Liquid Fund SIP' : 'Hybrid Fund SIP',
  }));
}

const PRODUCTS = [
  {
    slug: 'iphone-17-pro',
    name: 'iPhone 17 Pro',
    brand: 'Apple',
    category: 'smartphone',
    description: 'A17 Pro chip, titanium frame, and the new 48MP triple camera system.',
    variants: [
      {
        storage: '256GB', color: 'Silver', color_hex: '#E3E4E5',
        mrp: 134900, price: 127400, is_default: 1,
        image_url: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRKwuNngy_s8fYX3v7cvliC3OfEh4PH6OhuCZ7WDwMCnp1dAwdZbQkTawtiHx1PGAVEOqn13g6DRboefl7r1HQNcyOUKjqoZw',
        cashback: 7500,
      },
      {
        storage: '256GB', color: 'Cosmic Orange', color_hex: '#C96A3B',
        mrp: 134900, price: 127400,
        image_url: 'https://images.unsplash.com/photo-1557968623-bb7601aae078?w=600',
        cashback: 7500,
      },
      {
        storage: '512GB', color: 'Deep Blue', color_hex: '#2C3E50',
        mrp: 154900, price: 147400,
        image_url: 'https://images.unsplash.com/photo-1557968623-bb7601aae078?w=600',
        cashback: 7500,
      },
    ],
  },
  {
    slug: 'samsung-s24-ultra',
    name: 'Galaxy S24 Ultra',
    brand: 'Samsung',
    category: 'smartphone',
    description: 'Snapdragon 8 Gen 3, 200MP camera, built-in S Pen, titanium build.',
    variants: [
      {
        storage: '256GB', color: 'Titanium Black', color_hex: '#1C1C1E',
        mrp: 129999, price: 119999, is_default: 1,
        image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600',
        cashback: 6000,
      },
      {
        storage: '512GB', color: 'Titanium Gray', color_hex: '#8E8E93',
        mrp: 144999, price: 134999,
        image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600',
        cashback: 6000,
      },
    ],
  },
  {
    slug: 'oneplus-12',
    name: 'OnePlus 12',
    brand: 'OnePlus',
    category: 'smartphone',
    description: 'Snapdragon 8 Gen 3, Hasselblad camera tuning, 100W SUPERVOOC charging.',
    variants: [
      {
        storage: '256GB', color: 'Flowy Emerald', color_hex: '#1F5C4C',
        mrp: 69999, price: 64999, is_default: 1,
        image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600',
        cashback: 3000,
      },
      {
        storage: '512GB', color: 'Silky Black', color_hex: '#121212',
        mrp: 74999, price: 69999,
        image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600',
        cashback: 3000,
      },
    ],
  },
];

function seed() {
  initSchema();

  const insertProduct = db.prepare(`
    INSERT INTO products (slug, name, brand, category, description)
    VALUES (@slug, @name, @brand, @category, @description)
  `);
  const insertVariant = db.prepare(`
    INSERT INTO variants (product_id, storage, color, color_hex, mrp, price, image_url, in_stock, is_default)
    VALUES (@product_id, @storage, @color, @color_hex, @mrp, @price, @image_url, 1, @is_default)
  `);
  const insertEmi = db.prepare(`
    INSERT INTO emi_plans (variant_id, tenure_months, monthly_amount, interest_rate, cashback_amount, fund_partner)
    VALUES (@variant_id, @tenure_months, @monthly_amount, @interest_rate, @cashback_amount, @fund_partner)
  `);

  const seedAll = db.transaction(() => {
    for (const product of PRODUCTS) {
      const { lastInsertRowid: productId } = insertProduct.run(product);

      for (const variant of product.variants) {
        const { lastInsertRowid: variantId } = insertVariant.run({
          product_id: productId,
          storage: variant.storage,
          color: variant.color,
          color_hex: variant.color_hex,
          mrp: variant.mrp,
          price: variant.price,
          image_url: variant.image_url,
          is_default: variant.is_default || 0,
        });

        const plans = buildEmiPlans(variant.price, variant.cashback);
        for (const plan of plans) {
          insertEmi.run({ variant_id: variantId, ...plan });
        }
      }
    }
  });

  seedAll();
  console.log(`Seeded ${PRODUCTS.length} products.`);
}

seed();
