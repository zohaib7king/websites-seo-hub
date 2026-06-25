FROM node:20-alpine

WORKDIR /app

# Install deps. Skip optional deps so ssh2's native cpu-features (which needs a
# C toolchain) is not built — ssh2 works fine without it.
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --omit=optional --no-audit --no-fund

COPY index.js ./

ENV MCP_TRANSPORT=http
ENV PORT=8787
EXPOSE 8787

CMD ["node", "index.js"]
