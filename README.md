# Dosimetry Reports Demo (sanitized Angular copy)

Portfolio demo based on the **real SIVEEIC frontend** (Angular 7 + ngx-admin), not a redesign.

- Keeps the **dosimetría / reportes** module (filters, table, historic views)
- Removes login wall, unused modules, and institutional branding
- **DemoMockInterceptor** serves fictional `/api/*` data

## Local (Node 14)

```bash
# recommended: Docker build (matches production Node)
docker build -f Dockerfile.demo -t siveeic-demo .
docker run --rm -p 8080:80 siveeic-demo
```

Or with Node 14 locally:

```bash
npm ci
npm run build:prod
npx serve dist
```

Opens on `#/pages/dosimetria/reportes-dosimetria`.

## Deploy

Static `dist/` on Vercel (hash routing).
