# API & database guardrails

- **Parameterized SQL only** — always `db.query(sql, [params])`, never string interpolation.
- Every route handler wraps DB/API calls in `try/catch` and returns `res.status(4xx/5xx).json({ error })`.
  An unguarded DB error becomes an unhandled rejection that crashes the whole API process.
- Each route file exports a single `express.Router()`; routes live in `api/src/routes/`.
- AI calls use model `claude-sonnet-4-6`, `max_tokens: 2000`. Generation logic is shared via
  `api/src/services/generator.js` (route + queue worker both call `generateArticle`).
- The content queue is drained by `api/src/services/queueWorker.js` (hourly cron in `index.js`
  + manual `POST /api/ai/process-queue`); claims use `FOR UPDATE SKIP LOCKED`.
