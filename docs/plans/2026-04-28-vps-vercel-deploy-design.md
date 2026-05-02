# Bio4Dev VPS and Vercel Deploy Design

## Goal

Deploy Bio4Dev with the frontend on Vercel and the backend plus PostgreSQL on a VPS.

## Approved Architecture

- `https://bio4dev.davixs.com.br` serves the React/Vite frontend through Vercel.
- `https://api.bio4dev.davixs.com.br` serves the NestJS API through the VPS.
- PostgreSQL runs privately on the VPS and is only reachable by the backend container.
- Prisma migrations run during deploy before the backend starts serving traffic.

## Components

- Frontend: `front-bio4dev`, built by Vercel with `npm run build` and output directory `build`.
- Backend: NestJS app at the repository root, built with `npm run build` and started with `npm run start:prod`.
- Database: PostgreSQL 17 in Docker Compose with a persistent volume.
- Reverse proxy: Caddy or Nginx on the VPS, terminating HTTPS and forwarding API traffic to the backend container.
- DNS:
  - `bio4dev.davixs.com.br` points to Vercel.
  - `api.bio4dev.davixs.com.br` points to the VPS public IP.

## Environment Variables

Frontend production:

```env
VITE_API_URL=https://api.bio4dev.davixs.com.br
```

Backend production:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://bio4dev:<strong-password>@db:5432/api_bio4dev
DIRECT_URL=postgresql://bio4dev:<strong-password>@db:5432/api_bio4dev
CORS_ORIGIN=https://bio4dev.davixs.com.br
GOOGLE_REDIRECT_URI=https://api.bio4dev.davixs.com.br/auth/google/callback
GOOGLE_FRONTEND_REDIRECT_URI=https://bio4dev.davixs.com.br/auth/callback/google
JWT_ISSUER=https://api.bio4dev.davixs.com.br
JWT_AUDIENCE=https://api.bio4dev.davixs.com.br
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

Secrets such as database password, Google client secret, JWT keys, OAuth cookie secret, and email HMAC key must be generated or copied into the VPS `.env` file and kept out of Git.

## Data Flow

1. Browser opens `https://bio4dev.davixs.com.br`.
2. Vercel serves static frontend assets.
3. Frontend calls `https://api.bio4dev.davixs.com.br`.
4. VPS reverse proxy forwards requests to the NestJS backend.
5. Backend reads and writes PostgreSQL through the private Docker network.
6. Google OAuth redirects back to the API callback, then the API redirects to the frontend callback route.

## Operational Notes

- Do not expose PostgreSQL publicly.
- Only ports `22`, `80`, and `443` should be public on the VPS.
- The backend depends on the RSA key files under `keys/`; production must mount or copy them into the backend container.
- The current app stores uploads locally under `uploads`; the VPS deployment should persist that directory with a volume. A future improvement can move uploads to S3/R2.
- Existing local secrets in `.env` must be rotated before production if they have been shared or committed anywhere.

## Verification

- `https://api.bio4dev.davixs.com.br/api` opens Swagger.
- `https://bio4dev.davixs.com.br` loads the Vercel frontend.
- Frontend API calls return 2xx or expected auth responses.
- Google login uses the production callback and returns to the frontend.
- `docker compose ps` shows healthy database and running backend.
