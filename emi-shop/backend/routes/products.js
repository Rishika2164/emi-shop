const express = require('express');
const { db } = require('../db/database');

const router = express.Router();

function getEmiPlansForVariant(variantId) {
  return db
    .prepare('SELECT * FROM emi_plans WHERE variant_id = ? ORDER BY tenure_months ASC')
    .all(variantId);
}

function getVariantsForProduct(productId) {
  const variants = db
    .prepare('SELECT * FROM variants WHERE product_id = ? ORDER BY is_default DESC, id ASC')
    .all(productId);

  return variants.map((variant) => ({
    ...variant,
    emiPlans: getEmiPlansForVariant(variant.id),
  }));
}

// GET /api/products - list all products with their default/cheapest variant for the card view
router.get('/', (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY id ASC').all();

  const withDefaultVariant = products.map((product) => {
    const defaultVariant = db
      .prepare('SELECT * FROM variants WHERE product_id = ? ORDER BY is_default DESC, id ASC LIMIT 1')
      .get(product.id);
    return { ...product, defaultVariant };
  });

  res.json({ products: withDefaultVariant });
});

// GET /api/products/:slug - full product detail: all variants, each with its own EMI plans
router.get('/:slug', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE slug = ?').get(req.params.slug);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const variants = getVariantsForProduct(product.id);
  res.json({ product: { ...product, variants } });
});

// GET /api/products/:slug/variants/:variantId/emi-plans - EMI plans for one specific variant
router.get('/:slug/variants/:variantId/emi-plans', (req, res) => {
  const { slug, variantId } = req.params;
  const product = db.prepare('SELECT * FROM products WHERE slug = ?').get(slug);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const variant = db
    .prepare('SELECT * FROM variants WHERE id = ? AND product_id = ?')
    .get(variantId, product.id);

  if (!variant) {
    return res.status(404).json({ error: 'Variant not found for this product' });
  }

  res.json({ variant, emiPlans: getEmiPlansForVariant(variant.id) });
});

module.exports = router;
