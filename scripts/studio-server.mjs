// Local content studio — receives text edits from the dev site's in-place
// editor and writes them to src/content/editable-text.json. It saves LOCALLY
// only (no commit/push); the edits ride along with the next commit we make.
// Local only; never runs in production (the site is a static export).
//
//   npm run studio      # run alongside `npm run dev`, in its own terminal
//
import http from "node:http";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REL = "src/content/editable-text.json";
const JSON_PATH = path.join(ROOT, REL);
const PORT = 4477;

function send(res, code, obj) {
  res.writeHead(code, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(obj));
}

function handleSave(body, res) {
  const { edits } = JSON.parse(body || "{}");
  if (!edits || typeof edits !== "object") {
    return send(res, 400, { error: "no edits provided" });
  }

  const current = JSON.parse(readFileSync(JSON_PATH, "utf8"));
  let changed = 0;
  // Each entry is { value, default }. Store the value only when it differs from
  // the code default; if it's reverted to the default, drop the override so the
  // overrides file stays minimal.
  for (const [key, entry] of Object.entries(edits)) {
    if (!entry || typeof entry.value !== "string") continue;
    const value = entry.value;
    const def = typeof entry.default === "string" ? entry.default : "";
    if (value !== def) {
      if (current[key] !== value) {
        current[key] = value;
        changed++;
      }
    } else if (key in current) {
      delete current[key];
      changed++;
    }
  }

  if (changed === 0) return send(res, 200, { ok: true, changed: 0 });

  writeFileSync(JSON_PATH, JSON.stringify(current, null, 2) + "\n");
  console.log(`✎ saved ${changed} edit(s) locally (not pushed)`);
  return send(res, 200, { ok: true, changed, saved: true });
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});
  if (req.method === "POST" && req.url === "/save") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        handleSave(body, res);
      } catch (e) {
        send(res, 500, { error: String(e.message || e) });
      }
    });
    return;
  }
  send(res, 404, { error: "not found" });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(
    `✎ content studio on http://127.0.0.1:${PORT} — saves locally (push with your next update)`,
  );
});
