# Build context is the REPO ROOT (see docker-compose.yml build.context: .)
# so the local file: dependency packages/ui resolves and bundles into standalone.
FROM node:20-alpine AS builder
WORKDIR /app

COPY packages/ui ./packages/ui
RUN cd packages/ui && npm install && npm run build

COPY sites/site-002-finance/package*.json ./sites/site-002-finance/
RUN cd sites/site-002-finance && npm install

COPY sites/site-002-finance ./sites/site-002-finance
ARG NEXT_PUBLIC_API_URL=http://api:4000
ARG NEXT_PUBLIC_SITE_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_ID=$NEXT_PUBLIC_SITE_ID
RUN cd sites/site-002-finance && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/sites/site-002-finance/.next/standalone ./
COPY --from=builder /app/sites/site-002-finance/.next/static ./sites/site-002-finance/.next/static
COPY --from=builder /app/sites/site-002-finance/public ./sites/site-002-finance/public
EXPOSE 3000
ENV PORT=3000
CMD ["node", "sites/site-002-finance/server.js"]
