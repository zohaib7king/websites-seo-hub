import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Always load .env from the same directory as this script, regardless of cwd
const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '.env') })

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { Client } from 'ssh2'
import express from 'express'
import { randomUUID } from 'crypto'

// ── Config ─────────────────────────────────────────────────────────────────
const SSH_CONFIG = {
  host: process.env.SSH_HOST,
  port: Number(process.env.SSH_PORT ?? 22),
  username: process.env.SSH_USER,
  password: process.env.SSH_PASSWORD,
  readyTimeout: 20000,
}

// Single git repo (ZoyZoy Hub). docker-compose.yml lives at the repo root,
// so COMPOSE_PATH defaults to REPO_PATH.
const REPO_URL       = process.env.REPO_URL       ?? 'https://github.com/zohaib7king/websites-seo-hub.git'
const REPO_PATH      = process.env.REPO_PATH      ?? '/root/zoyzoy/websites-seo-hub'
const COMPOSE_PATH   = process.env.COMPOSE_PATH   ?? REPO_PATH
const GIT_BRANCH     = process.env.GIT_BRANCH     ?? 'main'
const DEPLOY_COMMAND = process.env.DEPLOY_COMMAND ?? 'docker compose up -d --build'

// Postgres lives in the `db` compose service (container zoyzoy_db).
const DB_SERVICE     = process.env.DB_SERVICE     ?? 'db'
const DB_USER        = process.env.DB_USER        ?? 'zoyzoy'
const DB_NAME        = process.env.DB_NAME        ?? 'zoyzoy_hub'
// Where migration .sql files live, relative to the repo root.
const MIGRATIONS_DIR = process.env.MIGRATIONS_DIR ?? 'api/src/db/migrations'

// ── SSH helper ──────────────────────────────────────────────────────────────
/**
 * Runs a shell command on the remote server via SSH.
 * Returns { stdout, stderr, exitCode }.
 */
function sshExec(command) {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    let stdout = ''
    let stderr = ''

    conn.on('ready', () => {
      conn.exec(command, { pty: false }, (err, stream) => {
        if (err) { conn.end(); return reject(err) }

        stream.on('data', (data) => { stdout += data.toString() })
        stream.stderr.on('data', (data) => { stderr += data.toString() })
        stream.on('close', (code) => {
          conn.end()
          resolve({ stdout: stdout.trim(), stderr: stderr.trim(), exitCode: code ?? 0 })
        })
      })
    })

    conn.on('error', reject)
    conn.connect(SSH_CONFIG)
  })
}

function formatResult({ stdout, stderr, exitCode }) {
  const lines = []
  if (stdout) lines.push(`✅ Output:\n${stdout}`)
  if (stderr) lines.push(`⚠️  Stderr:\n${stderr}`)
  lines.push(exitCode === 0 ? '✅ Command succeeded (exit 0)' : `❌ Command failed (exit ${exitCode})`)
  return lines.join('\n\n')
}

/**
 * Returns a shell snippet that clones the repo if REPO_PATH is missing,
 * otherwise pulls the latest commit on GIT_BRANCH.
 */
function ensureRepoCmd() {
  return (
    `if [ -d ${REPO_PATH}/.git ]; then ` +
    `cd ${REPO_PATH} && git fetch origin ${GIT_BRANCH} && git checkout ${GIT_BRANCH} && git pull origin ${GIT_BRANCH}; ` +
    `else mkdir -p $(dirname ${REPO_PATH}) && git clone -b ${GIT_BRANCH} ${REPO_URL} ${REPO_PATH}; fi`
  )
}

// ── Tool definitions ────────────────────────────────────────────────────────
const TOOLS = [
  {
    name: 'deploy_full',
    description:
      'Full ZoyZoy Hub deployment: (1) clone-or-pull the websites-seo-hub repo on the server, ' +
      '(2) cd repo root && docker compose up -d --build, ' +
      '(3) optionally apply the idempotent SQL migrations in api/src/db/migrations via psql.',
    inputSchema: {
      type: 'object',
      properties: {
        run_migrations: {
          type: 'boolean',
          description: 'Apply every .sql file in api/src/db/migrations (idempotent) after containers start. Default: true',
        },
      },
    },
  },
  {
    name: 'pull_code',
    description: 'Clone (if missing) or git pull the latest websites-seo-hub code on the server, without restarting containers.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'restart_containers',
    description: 'Run the docker compose deploy command to rebuild and restart all ZoyZoy containers (without git pull).',
    inputSchema: {
      type: 'object',
      properties: {
        command_override: {
          type: 'string',
          description: 'Override the default docker compose command. Leave empty to use the configured DEPLOY_COMMAND.',
        },
      },
    },
  },
  {
    name: 'apply_migration',
    description:
      'Apply ZoyZoy SQL migrations via `docker compose exec -T db psql`. ' +
      'Give a single `file` (relative to api/src/db/migrations) to run just that one, ' +
      'or leave empty to run ALL .sql files in that folder in sorted order (they are idempotent).',
    inputSchema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          description: 'A single migration filename, e.g. "001_add_image_url_and_theme.sql". Empty = run all.',
        },
      },
    },
  },
  {
    name: 'server_status',
    description: 'Check which ZoyZoy Docker containers are running on the server (docker compose ps).',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'run_server_command',
    description:
      'Run any arbitrary shell command on the server. Use with caution. ' +
      'Useful for one-off operations like checking logs, disk space, ls, etc.',
    inputSchema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'Shell command to execute on the server.',
        },
      },
      required: ['command'],
    },
  },
]

// ── Tool handlers ───────────────────────────────────────────────────────────
async function applyAllMigrations() {
  // List .sql files, then pipe each into psql inside the db container.
  const psql = `docker compose exec -T ${DB_SERVICE} psql -U ${DB_USER} -d ${DB_NAME}`
  const cmd =
    `cd ${COMPOSE_PATH} && ` +
    `for f in $(ls ${MIGRATIONS_DIR}/*.sql 2>/dev/null | sort); do ` +
    `echo "── applying $f ──"; ${psql} < "$f" || exit 1; done`
  return sshExec(cmd)
}

async function applyOneMigration(file) {
  const psql = `docker compose exec -T ${DB_SERVICE} psql -U ${DB_USER} -d ${DB_NAME}`
  return sshExec(`cd ${COMPOSE_PATH} && ${psql} < ${MIGRATIONS_DIR}/${file}`)
}

async function handleTool(name, args) {
  if (!SSH_CONFIG.host || !SSH_CONFIG.username || !SSH_CONFIG.password) {
    return '❌ SSH not configured. Copy .env.example to .env and fill in SSH_HOST, SSH_USER, SSH_PASSWORD.'
  }

  switch (name) {

    case 'deploy_full': {
      const runMigrations = args?.run_migrations !== false
      const lines = []

      // Step 1 — clone or pull
      lines.push('━━━ Step 1/3: clone-or-pull websites-seo-hub ━━━')
      const pull = await sshExec(ensureRepoCmd())
      lines.push(formatResult(pull))
      if (pull.exitCode !== 0) return lines.join('\n\n') + '\n\n❌ Stopped at Step 1.'

      // Step 2 — docker compose up
      lines.push(`━━━ Step 2/3: ${DEPLOY_COMMAND} ━━━`)
      const compose = await sshExec(`cd ${COMPOSE_PATH} && ${DEPLOY_COMMAND}`)
      lines.push(formatResult(compose))
      if (compose.exitCode !== 0) return lines.join('\n\n') + '\n\n❌ Stopped at Step 2.'

      // Step 3 — migrations (idempotent SQL files)
      if (runMigrations) {
        lines.push('━━━ Step 3/3: apply SQL migrations (idempotent) ━━━')
        await sshExec('sleep 6') // let Postgres become ready
        const migrate = await applyAllMigrations()
        lines.push(formatResult(migrate))
        if (migrate.exitCode !== 0) return lines.join('\n\n') + '\n\n❌ Migration failed.'
      }

      lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      lines.push('🚀 Full deploy complete!')
      return lines.join('\n\n')
    }

    case 'pull_code': {
      const result = await sshExec(ensureRepoCmd())
      return `📥 Code synced!\n\n${formatResult(result)}`
    }

    case 'restart_containers': {
      const cmd = args?.command_override?.trim() || DEPLOY_COMMAND
      const result = await sshExec(`cd ${COMPOSE_PATH} && ${cmd}`)
      return `🐳 Containers restarted!\n\n${formatResult(result)}`
    }

    case 'apply_migration': {
      const file = String(args?.file ?? '').trim()
      const result = file ? await applyOneMigration(file) : await applyAllMigrations()
      const label = file ? `migration ${file}` : 'all migrations'
      return `🗄️ Applied ${label}\n\n${formatResult(result)}`
    }

    case 'server_status': {
      const result = await sshExec(`cd ${COMPOSE_PATH} && docker compose ps`)
      return `📊 Container status:\n\n${formatResult(result)}`
    }

    case 'run_server_command': {
      const cmd = String(args?.command ?? '').trim()
      if (!cmd) return '❌ command is required.'
      const result = await sshExec(cmd)
      return `💻 Command: ${cmd}\n\n${formatResult(result)}`
    }

    default:
      return `❌ Unknown tool: ${name}`
  }
}

// ── MCP Server factory ────────────────────────────────────────────────────
function createMcpServer() {
  const server = new Server(
    { name: 'zoyzoy-deploy', version: '1.0.0' },
    { capabilities: { tools: {} } }
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }))

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params
    try {
      const text = await handleTool(name, args ?? {})
      return { content: [{ type: 'text', text }] }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return {
        content: [{ type: 'text', text: `❌ Error: ${msg}` }],
        isError: true,
      }
    }
  })

  return server
}

// ── Auth ────────────────────────────────────────────────────────────────────
// Two independent gates (either passing is enough), so the server works with a
// URL-only connector flow (secret in path) AND with a Bearer-token flow:
//   • MCP_PATH_SECRET — must appear as the first path segment: /<secret>/mcp
//   • MCP_AUTH_TOKEN  — accepted via `Authorization: Bearer <token>`
const PATH_SECRET = process.env.MCP_PATH_SECRET ?? ''
const AUTH_TOKEN  = process.env.MCP_AUTH_TOKEN ?? ''

function bearerOk(req) {
  if (!AUTH_TOKEN) return false
  const h = req.headers['authorization'] || ''
  return h.replace(/^Bearer\s+/i, '').trim() === AUTH_TOKEN
}

// ── HTTP transport (remote connector) ────────────────────────────────────────
async function startHttp() {
  const port = Number(process.env.PORT ?? 8787)
  const app = express()
  app.use(express.json({ limit: '4mb' }))

  // Liveness check (no auth) — handy for nginx/uptime probes.
  app.get('/healthz', (_req, res) => res.json({ ok: true }))

  // Accept both /mcp (Bearer auth) and /<secret>/mcp (path auth).
  const handler = async (req, res) => {
    const pathOk = PATH_SECRET && req.params.secret === PATH_SECRET
    if (!pathOk && !bearerOk(req)) {
      return res.status(401).json({ error: 'unauthorized' })
    }
    // Stateless: a fresh server + transport per request.
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
    res.on('close', () => { transport.close() })
    const server = createMcpServer()
    await server.connect(transport)
    await transport.handleRequest(req, res, req.body)
  }

  app.post('/mcp', (req, res) => { req.params.secret = undefined; return handler(req, res) })
  app.post('/:secret/mcp', handler)

  // Stateless mode doesn't use long-lived GET/DELETE sessions.
  const method405 = (_req, res) =>
    res.status(405).json({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed.' }, id: null })
  app.get('/mcp', method405)
  app.get('/:secret/mcp', method405)
  app.delete('/mcp', method405)
  app.delete('/:secret/mcp', method405)

  app.listen(port, () => {
    console.error(`zoyzoy-deploy MCP (HTTP) listening on :${port}`)
    if (!PATH_SECRET && !AUTH_TOKEN) {
      console.error('⚠️  No MCP_PATH_SECRET or MCP_AUTH_TOKEN set — server is UNAUTHENTICATED.')
    }
  })
}

// ── stdio transport (local use / Claude Code) ─────────────────────────────────
async function startStdio() {
  const server = createMcpServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

// ── Start ─────────────────────────────────────────────────────────────────────
const mode = (process.env.MCP_TRANSPORT ?? 'stdio').toLowerCase()
if (mode === 'http' || process.env.PORT) {
  await startHttp()
} else {
  await startStdio()
}
