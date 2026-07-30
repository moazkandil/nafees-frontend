# NAFEES Perfumes

Production storefront and administration system for NAFEES Perfumes. The frontend is HTML, CSS, and JavaScript; the API uses Node.js, Express, MongoDB/Mongoose, JWT, bcrypt, Multer, Helmet, CORS, Morgan, and rate limiting. Checkout supports Cash on Delivery only.

## Main areas

- Public catalogue, product details, cart, wishlist, checkout, and order confirmation
- Customer registration, login, synchronized cart/wishlist, and order history
- Contact and newsletter submission
- Protected administrator dashboard for products, orders, customers, and messages
- REST API in `backend/`
- Production static server in `frontend-server.js`

## Run locally

Requires Node.js 20+ and a MongoDB database.

1. Copy `backend/.env.example` to `backend/.env`.
2. Fill in the required values. Do not commit `.env`.
3. Install and start the API:

       cd backend
       npm install
       npm start

4. In a second terminal, start the frontend:

       npm install
       npm start

5. Open `http://localhost:4173`. The admin login is at `http://localhost:4173/admin`.

For local development, change `apiUrl` in `JS/site-config.js` to `http://localhost:5000/api`. Restore the production URL before deploying.

## Required backend variables

- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

See `backend/.env.example` for optional variables and safe examples. `PORT` is supplied automatically by Railway.

## Useful checks

From the project root:

    npm run check
    npm test

From `backend/`:

    npm run check
    npm test
    npm audit

## Production

- Frontend: https://nafees-frontend-production.up.railway.app
- Backend: https://nafees-backend-production.up.railway.app
- Health: https://nafees-backend-production.up.railway.app/api/health
- Readiness: https://nafees-backend-production.up.railway.app/api/ready

Railway should deploy the frontend with `npm start` from the project root and the backend from `backend/`. CORS `CLIENT_URL` must exactly match the frontend origin, without a path.

## Security

Never commit `.env`, database credentials, JWT secrets, or administrator passwords. If a credential is posted publicly or in chat, rotate it in the provider dashboard and update Railway.
