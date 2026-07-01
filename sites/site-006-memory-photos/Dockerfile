# Build context is the REPO ROOT (see docker-compose.yml build.context: .)
FROM node:20-alpine AS builder
WORKDIR /app

COPY packages/ui ./packages/ui
RUN cd packages/ui && npm install && npm run build

COPY sites/site-006-memory-photos/package*.json ./sites/site-006-memory-photos/
RUN cd sites/site-006-memory-photos && npm install

COPY sites/site-006-memory-photos ./sites/site-006-memory-photos
ARG NEXT_PUBLIC_API_URL=http://api:4000
ARG NEXT_PUBLIC_SITE_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_ID=$NEXT_PUBLIC_SITE_ID
RUN cd sites/site-006-memory-photos && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/sites/site-006-memory-photos/.next/standalone ./
COPY --from=builder /app/sites/site-006-memory-photos/.next/static ./sites/site-006-memory-photos/.next/static
COPY --from=builder /app/sites/site-006-memory-photos/public ./sites/site-006-memory-photos/public
EXPOSE 3000
ENV PORT=3000
CMD ["node", "sites/site-006-memory-photos/server.js"]
