# Build context is the REPO ROOT (see docker-compose.yml crm.build.context: .)
# so the local file: dependency packages/ui resolves inside the image.
FROM node:20-alpine AS builder
WORKDIR /app

# Build the local design-system package first (its dist is what the CRM imports).
COPY packages/ui ./packages/ui
RUN cd packages/ui && npm install && npm run build

# Install CRM deps (the file:../packages/ui dep now resolves to the built package).
COPY crm/package*.json ./crm/
RUN cd crm && npm install

# Build the CRM.
COPY crm ./crm
RUN cd crm && npm run build

FROM nginx:alpine
COPY --from=builder /app/crm/dist /usr/share/nginx/html
COPY crm/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
