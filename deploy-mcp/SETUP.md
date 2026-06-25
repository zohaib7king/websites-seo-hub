# Hosting the ZoyZoy deploy MCP at https://mcp.skool.cloud

This MCP runs as an HTTP server behind Caddy (automatic Let's Encrypt TLS) on the
dev server, so Claude can add it as a remote connector via an `https://` URL.

## Architecture

```
Claude (connector)  ──https──>  Caddy (:80/:443, auto-TLS)  ──>  mcp container (:8787)
                                                                      │ SSH
                                                                      ▼
                                                          the dev server itself
                                                       (git pull, docker compose, psql)
```

The MCP container SSHes to the server (`SSH_HOST` in `.env`) to run deploys — same
as the original design, just now reachable over HTTPS.

## Auth

Two gates, either is sufficient (see `.env`):
- **Path secret** — connector URL: `https://mcp.skool.cloud/<MCP_PATH_SECRET>/mcp`
- **Bearer token** — header `Authorization: Bearer <MCP_AUTH_TOKEN>`

Without a valid secret/token every request returns `401`. Keep `.env` private.

## Prerequisites

1. **DNS**: add an A record `mcp.skool.cloud -> 167.86.100.217` at your DNS provider.
   Verify it resolves before starting Caddy (cert issuance fails otherwise):
   `dig +short mcp.skool.cloud` → should print `167.86.100.217`.
2. **Ports 80 and 443 must be free** on the host (Caddy needs both). If something
   else (the skool app, another nginx/traefik) already binds them, we integrate
   with that proxy instead of running Caddy — see "Port conflicts" below.
3. `deploy-mcp/.env` present on the server with real secrets.

## Steps (run on the server, in the deploy-mcp folder)

```bash
# 0. (inspection — see what's on 80/443 first)
ss -tlnp | grep -E ':80|:443' || true
docker ps --format '{{.Names}}: {{.Ports}}'

# 1. build + start
docker compose up -d --build

# 2. watch Caddy obtain the cert
docker compose logs -f caddy        # look for "certificate obtained successfully"

# 3. verify from anywhere
curl -s https://mcp.skool.cloud/healthz      # -> {"ok":true}
```

## Add the connector in Claude

- URL: `https://mcp.skool.cloud/<MCP_PATH_SECRET>/mcp`
  (substitute the real secret from `.env`)
- If the connector UI has a token/header field instead, use base URL
  `https://mcp.skool.cloud/mcp` + `Authorization: Bearer <MCP_AUTH_TOKEN>`.

## Port conflicts (if 80/443 are taken)

If the skool app or another proxy already owns 80/443, do **not** run the Caddy
service. Instead expose only the `mcp` container and add a vhost to the existing
proxy that terminates TLS for `mcp.skool.cloud` and proxies to the mcp container.
We'll decide this after the inspection step.
