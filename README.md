# E-commerce Order Management

A small order-management app: an Express API over an in-memory store, and a React + TypeScript (Vite) frontend.

## Structure

```
backend/   Express 5 API — routes → services (business rules) → data store
frontend/  React 19 + TypeScript, built with Vite
```

The backend is layered so the rules live in one place: `routes/` only parses requests and shapes responses, `services/orderService.js` holds validation, pricing and the status-transition policy, and `data/store.js` is the only module that touches the orders array.

## Running locally

Backend (defaults to port 4000, override with `PORT`):

```bash
cd backend
npm install
npm run dev
```

Frontend (Vite dev server):

```bash
cd frontend
npm install
npm run dev
```

## API

Base path: `/api`

| Method | Endpoint             | Description                                      |
| ------ | -------------------- | ------------------------------------------------ |
| GET    | `/catalogue`         | Products with prices, plus the list of statuses  |
| GET    | `/orders`            | All orders; optional `?status=` filter           |
| POST   | `/orders`            | Create an order (`customerName`, `product`, `quantity`) |
| PATCH  | `/orders/:id/status` | Move an order to a new `status`                  |

`totalAmount` is always computed server-side from the catalogue price — a `totalAmount` sent in the request body is ignored.

### Order lifecycle

```
Pending ──> Confirmed ──> Shipped ──> Delivered
   │            │
   └──────> Cancelled <──┘
```

`Delivered` and `Cancelled` are terminal. Any other transition is rejected with a 400 before the order is modified.

## Notes

Orders are held in memory, so the data resets whenever the backend restarts. The seed data is in `backend/src/data/store.js`.
