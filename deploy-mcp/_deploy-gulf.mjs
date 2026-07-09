// One-off deploy: pull latest + rebuild ONLY site-005-gulf-jobs on the server.
// Uses the deploy-mcp's own ssh2 + .env (same machinery as the MCP tools).
import { config } from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, ".env") });
import { Client } from "ssh2";

const cfg = {
  host: process.env.SSH_HOST,
  port: Number(process.env.SSH_PORT || 22),
  username: process.env.SSH_USER,
  password: process.env.SSH_PASSWORD,
  readyTimeout: 20000,
};
const REPO = process.env.REPO_PATH;
const BRANCH = process.env.GIT_BRANCH || "main";

const remote = `
set -e
cd ${REPO}
echo "==== git pull (${BRANCH}) ===="
git fetch origin ${BRANCH}
git checkout ${BRANCH}
git pull origin ${BRANCH}
echo "==== HEAD now ===="
git --no-pager log --oneline -1
echo "==== rebuild site-005-gulf-jobs ===="
docker compose up -d --build site-005-gulf-jobs
echo "==== container status ===="
docker compose ps site-005-gulf-jobs
echo "==== local probe (127.0.0.1:3006) ===="
curl -s -o /dev/null -w "home -> %{http_code}\\n" http://127.0.0.1:3006/ || true
curl -s http://127.0.0.1:3006/article/how-to-use-linkedin-and-gulf-job-portals | grep -o -E "application/ld\\+json|article-image|How to Use LinkedIn" | sort | uniq -c || true
echo "==== done ===="
`;

const b64 = Buffer.from(remote, "utf8").toString("base64");
const command = `echo ${b64} | base64 -d | bash`;

const conn = new Client();
conn.on("ready", () => {
  conn.exec(command, { pty: false }, (err, stream) => {
    if (err) { console.error("exec error:", err.message); conn.end(); process.exit(1); }
    stream.on("data", (d) => process.stdout.write(d.toString()));
    stream.stderr.on("data", (d) => process.stdout.write(d.toString()));
    stream.on("close", (code) => { console.log(`\n[remote exit ${code}]`); conn.end(); process.exit(code || 0); });
  });
});
conn.on("error", (e) => { console.error("SSH error:", e.message); process.exit(1); });
conn.connect(cfg);
