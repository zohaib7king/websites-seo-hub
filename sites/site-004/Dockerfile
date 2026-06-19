# Build context is the REPO ROOT (see docker-compose.yml build.context: .)
# so the local file: dependency packages/ui resolves and bundles into standalone.
FROM node:20-alpine AS builder
WORKDIR /app

COPY packages/ui ./packages/ui
RUN cd packages/ui && npm install && npm run build

COPY sites/site-004/package*.json ./sites/site-004/
RUN cd sites/site-004 && npm install

COPY sites/site-004 ./sites/site-004
ARG NEXT_PUBLIC_API_URL=http://api:4000
ARG NEXT_PUBLIC_SITE_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_ID=$NEXT_PUBLIC_SITE_ID
RUN cd sites/site-004 && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/sites/site-004/.next/standalone ./
COPY --from=builder /app/sites/site-004/.next/static ./sites/site-004/.next/static
COPY --from=builder /app/sites/site-004/public ./sites/site-004/public
EXPOSE 3000
ENV PORT=3000
CMD ["node", "sites/site-004/server.js"]
