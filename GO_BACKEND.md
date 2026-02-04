# Go Backend (SQLite) Setup

This project can use a local Go API with SQLite as the database. The React app will automatically use the Go API for data **when `VITE_API_BASE_URL` is set**.

## 1) Start the Go API

From the repository root:

```bash
cd server
go run .
```

By default the API listens on `http://localhost:8080` and creates `server/laundry.db`.

### Optional environment variables

- `PORT` (default: `8080`)
- `DATABASE_URL` (default: `laundry.db`)

Example:

```bash
PORT=8080 DATABASE_URL=./laundry.db go run .
```

## 2) Point the React app to the API

Add to your `.env.local`:

```
VITE_API_BASE_URL=http://localhost:8080
```

Restart the React dev server after updating `.env.local`.

## API Endpoints

```
GET    /health
GET    /customers
POST   /customers
GET    /customers/{id}
PUT    /customers/{id}
DELETE /customers/{id}

GET    /items
POST   /items
GET    /items/{id}
PUT    /items/{id}
DELETE /items/{id}

GET    /orders
POST   /orders
GET    /orders/{id}
PUT    /orders/{id}
DELETE /orders/{id}

GET    /transactions
POST   /transactions
GET    /transactions/{id}
PUT    /transactions/{id}
DELETE /transactions/{id}

GET    /analytics/total-revenue
GET    /analytics/total-orders
```

## Notes

- Auth still uses Supabase. Keep your existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` if you want authentication enabled.
- Data operations (customers, items, orders, transactions) will use the Go API whenever `VITE_API_BASE_URL` is set. Otherwise, they use Supabase as before.
