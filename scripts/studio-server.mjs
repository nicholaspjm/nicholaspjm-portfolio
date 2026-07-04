// Local content studio — receives text edits from the dev site's in-place
// editor, writes them back to src/content/editable-text.json, then commits and
// pushes to `origin` so the change deploys to live. Local only; never runs in
// production (the site is a static export with no server).
//
//   npm run studio      # run alongside `npm run dev`, in its own terminal
//
import http from "node:http";
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
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

function git(...args) {
  return execFileSync("git", args, { cwd: ROOT }).toString().trim();
}

function handleSave(body, res) {
  const { edits } = JSON.parse(body || "{}");
  if (!edits || typeof edits !== "object") {
    return send(res, 400, { error: "no edits provided" });
  }

  const current = JSON.parse(readFileSync(JSON_PATH, "utf8"));
  let changed = 0;
  for (const [key, val] of Object.entries(edits)) {
    // Only update keys we already know about, and only real string changes.
    if (typeof val === "string" && key in current && current[key] !== val) {
      current[key] = val;
      changed++;
    }
  }

  if (changed === 0) return send(res, 200, { ok: true, changed: 0 });

  writeFileSync(JSON_PATH, JSON.stringify(current, null, 2) + "\n");

  try {
    git("add", REL);
    git("commit", "-m", "Edit site text via studio");
    const branch = git("rev-parse", "--abbrev-ref", "HEAD");
    git("push", "origin", branch);
    console.log(`✎ pushed ${changed} edit(s) to ${branch}`);
    return send(res, 200, { ok: true, changed, pushed: true, branch });
  } catch (e) {
    return send(res, 500, {
      error: `wrote file but git failed: ${String(e.message || e)}`,
    });
  }
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
    `✎ content studio on http://127.0.0.1:${PORT} — saves push to live`,
  );
});
