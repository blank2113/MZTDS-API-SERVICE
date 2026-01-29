import { Router } from "express";
import fs from "fs";
import { logFilePath } from "./logger.js";

const router = Router();

// JSON
router.get("/", (req, res) => {
  if (!fs.existsSync(logFilePath)) {
    return res.json([]);
  }

  const logs = fs
    .readFileSync(logFilePath, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .slice(-200);

  res.json(logs);
});

// UI
router.get("/ui", (req, res) => {
  res.send(`
<!doctype html>
<html>
<head>
  <title>Logs</title>
  <style>
    body { font-family: monospace; background:#111; color:#eee; padding:20px }
    .log { margin-bottom:8px }
    .info { color:#4caf50 }
    .error { color:#f44336 }
    .warn { color:#ff9800 }
  </style>
</head>
<body>
  <h2>Application Logs</h2>
  <div id="logs"></div>

  <script>
    fetch('/api/v1/logs')
      .then(r => r.json())
      .then(data => {
        const el = document.getElementById('logs');
        data.reverse().forEach(l => {
          const div = document.createElement('div');
          div.className = 'log ' + (l.level || 'info');
          div.textContent =
            '[' + l.timestamp + '] ' +
            (l.level || '') + ' ' +
            (l.message || '');
          el.appendChild(div);
        });
      });
  </script>
</body>
</html>
  `);
});

export default router;
