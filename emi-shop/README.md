# EMI Shop

A small full-stack app that lists phones and lets a shopper pick a variant (storage/colour)
and an EMI plan for it, similar to how Snapmint presents "EMI backed by mutual funds" on a
product page. Built for the 1Fi SDE1 assignment.

Live demo: _add your deployed link here_
Video walkthrough: _add your Drive/YouTube link here_

## What's in here

```
emi-shop/
├── backend/     Express API + SQLite database
└── frontend/    React (Vite) + Tailwind UI
```

## Tech stack

- **Frontend:** React (Vite), React Router, Tailwind CSS v4
- **Backend:** Node.js, Express
- **Database:** SQLite via `better-sqlite3` (a real SQL database, just file-based — no
  separate DB server to install for local dev or grading). Swapping this for Postgres
  later is mostly a matter of replacing `db/database.js` and the prepared statements
  with `pg`; the schema in `schema.sql` is already close to plain ANSI SQL.

## Getting it running locally

You'll need Node 18+.

**1. Backend**

```bash
cd backend
npm install
npm run seed      # creates db/emi_shop.db and loads 3 products with variants + EMI plans
npm run dev        # starts the API on http://localhost:4000 (npm start also works)
```

**2. Frontend** (in a second terminal)

```bash
cd frontend
npm install
cp .env.example .env    # points the app at http://localhost:4000/api — edit if your API runs elsewhere
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). You should see three
products; click into one to see the variant picker and EMI plan list.

Re-running `npm run seed` wipes and reloads the database if you want a clean slate.

## Database schema

Three tables. A product has many variants (each variant is a specific storage + colour
combination, since that's what actually has its own price). A variant has many EMI
plans, because the monthly amount depends on that variant's price.

```
products
  id, slug, name, brand, category, description, created_at

variants
  id, product_id → products.id, storage, color, color_hex,
  mrp, price, image_url, in_stock, is_default

emi_plans
  id, variant_id → variants.id, tenure_months, monthly_amount,
  interest_rate, cashback_amount, fund_partner
```

Full DDL is in `backend/db/schema.sql`. Seed data (3 products, 7 variants total, 7 EMI
tenures each) is in `backend/db/seed.js` — EMI amounts are computed with the standard
reducing-balance formula, not hardcoded, so changing a variant's price recalculates
every plan automatically.

## API endpoints

**`GET /api/products`** — all products with their default variant (for the home page grid)

```json
{
  "products": [
    {
      "id": 1,
      "slug": "iphone-17-pro",
      "name": "iPhone 17 Pro",
      "brand": "Apple",
      "description": "A17 Pro chip, titanium frame, and the new 48MP triple camera system.",
      "defaultVariant": {
        "id": 1,
        "storage": "256GB",
        "color": "Silver",
        "mrp": 134900,
        "price": 127400,
        "image_url": "https://images.unsplash.com/photo-1592286927505-1def25115481?w=600"
      }
    }
  ]
}
```

**`GET /api/products/:slug`** — one product with every variant, each carrying its own
EMI plan list

```json
{
  "product": {
    "slug": "iphone-17-pro",
    "name": "iPhone 17 Pro",
    "variants": [
      {
        "id": 1,
        "storage": "256GB",
        "color": "Silver",
        "mrp": 134900,
        "price": 127400,
        "emiPlans": [
          { "tenure_months": 3, "monthly_amount": 42467, "interest_rate": 0, "cashback_amount": 7500 },
          { "tenure_months": 6, "monthly_amount": 21233, "interest_rate": 0, "cashback_amount": 7500 },
          { "tenure_months": 12, "monthly_amount": 10617, "interest_rate": 0, "cashback_amount": 7500 },
          { "tenure_months": 24, "monthly_amount": 5308, "interest_rate": 0, "cashback_amount": 7500 },
          { "tenure_months": 36, "monthly_amount": 4141, "interest_rate": 10.5, "cashback_amount": 7500 },
          { "tenure_months": 48, "monthly_amount": 3262, "interest_rate": 10.5, "cashback_amount": 7500 },
          { "tenure_months": 60, "monthly_amount": 2738, "interest_rate": 10.5, "cashback_amount": 7500 }
        ]
      }
    ]
  }
}
```

**`GET /api/products/:slug/variants/:variantId/emi-plans`** — EMI plans for just one
variant, useful if the frontend wants to refetch after a colour/storage change instead
of holding everything in memory.

`GET /api/health` — plain `{ "status": "ok" }`, mostly for checking the deploy went fine.

Products that don't exist return a 404 with `{ "error": "..." }`.

## Frontend routes

- `/` — product grid, pulled from `/api/products`
- `/products/:slug` — product page: image, price, variant picker, EMI plan list, and a
  "Proceed" button that confirms the selected plan

Each product has its own URL (`/products/iphone-17-pro`, `/products/samsung-s24-ultra`,
`/products/oneplus-12`), and nothing on the page is hardcoded — every field comes from
the API response.

## Deploying

**Backend (Render):** SQLite needs a writable disk, so Render's free web service works
better here than a serverless platform. Set the build command to `npm install && npm run seed`
and the start command to `npm start`. Add a persistent disk mounted at `/backend/db`
if you want the data to survive redeploys.

**Frontend (Vercel):** Standard Vite deploy — build command `npm run build`, output
directory `dist`. Set `VITE_API_URL` in the Vercel project settings to your deployed
backend's `/api` URL.

## Notes / things I'd do next with more time

- Move to Postgres for a real deployment (SQLite is fine for a demo, less so under
  concurrent writes)
- Add pagination to `/api/products` once the catalog grows past a handful of items
- Persist the "selected plan" choice somewhere (right now it just confirms in the UI —
  there's no orders table yet)
