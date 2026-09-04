require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const { initSchema } = require('./db/database');
const productsRouter = require('./routes/products');

// If the DB file doesn't exist yet, create schema so the app doesn't crash on a
// fresh clone before anyone remembers to run `npm run seed`.
const dbFile = path.join(__dirname, 'db', 'emi_shop.db');
if (!fs.existsSync(dbFile)) {
  initSchema();
}

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/products', productsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`EMI shop API running on http://localhost:${PORT}`);
});
