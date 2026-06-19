require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const { processQueue } = require("./services/queueWorker");

const app = express();
app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────────────────
app.use("/api/sites",    require("./routes/sites"));
app.use("/api/articles", require("./routes/articles"));
app.use("/api/ai",       require("./routes/ai"));
app.use("/api/revenue",  require("./routes/revenue"));
app.use("/api/queue",    require("./routes/queue"));

app.get("/health", (_req, res) => res.json({ status: "ok", service: "zoyzoy-api" }));

// ── Scheduler ────────────────────────────────────────────
// Every hour, drain the content queue (pending keywords -> draft articles).
// Disable with QUEUE_CRON=off; tune batch size with QUEUE_BATCH.
if (process.env.QUEUE_CRON !== "off") {
  cron.schedule("0 * * * *", async () => {
    try {
      const result = await processQueue(Number(process.env.QUEUE_BATCH) || 5);
      console.log(`[queue-cron] claimed=${result.claimed} done=${result.done} failed=${result.failed}`);
    } catch (err) {
      console.error("[queue-cron] error:", err.message);
    }
  });
  console.log("Queue cron scheduled: hourly (set QUEUE_CRON=off to disable)");
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`ZoyZoy API running on port ${PORT}`));
