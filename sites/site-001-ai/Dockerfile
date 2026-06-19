# Build context is the REPO ROOT (see docker-compose.yml build.context: .)
# so the local file: dependency packages/ui resolves and bundles into standalone.
FROM node:20-alpine AS builder
WORKDIR /app

# Build the local design-system package first.
COPY packages/ui ./packages/ui
RUN cd packages/ui && npm install && npm run build

# Install site deps (the file:../../packages/ui dep now resolves).
COPY sites/site-001-ai/package*.json ./sites/site-001-ai/
RUN cd sites/site-001-ai && npm install

# Build the site. NEXT_PUBLIC_* are inlined at build time (docker-compose build.args).
COPY sites/site-001-ai ./sites/site-001-ai
ARG NEXT_PUBLIC_API_URL=http://api:4000
ARG NEXT_PUBLIC_SITE_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_ID=$NEXT_PUBLIC_SITE_ID
RUN cd sites/site-001-ai && npm run build

FROM node:20-alpine
WORKDIR /app
# With outputFileTracingRoot=repo root, standalone mirrors the monorepo layout.
COPY --from=builder /app/sites/site-001-ai/.next/standalone ./
COPY --from=builder /app/sites/site-001-ai/.next/static ./sites/site-001-ai/.next/static
COPY --from=builder /app/sites/site-001-ai/public ./sites/site-001-ai/public
EXPOSE 3000
ENV PORT=3000
CMD ["node", "sites/site-001-ai/server.js"]
