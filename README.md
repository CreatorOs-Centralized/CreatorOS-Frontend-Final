# How to start

1. pnpm i
2. Create a `.env` file (copy from `.env.example`)
3. pnpm dev

## Dev URLs (defaults)

- Keycloak: `http://localhost:8081`
- auth-service: `http://localhost:8082`

Note: in dev, the app calls `/__keycloak/**` and `/__auth/**` which Vite proxies to the URLs above (avoids CORS without changing backend).