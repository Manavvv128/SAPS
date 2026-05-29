const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number(process.env.PORT || 4200);
const host = "127.0.0.1";
const root = __dirname;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function resolveRequestPath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  const requestedPath = cleanPath === "/" ? "/pages/index.html" : cleanPath;
  const filePath = path.join(root, requestedPath);
  const normalized = path.normalize(filePath);

  if (!normalized.startsWith(root)) {
    return null;
  }

  return normalized;
}

const server = http.createServer((req, res) => {
  const filePath = resolveRequestPath(req.url || "/");

  if (!filePath) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(content);
  });
});

server.listen(port, host, () => {
  console.log(`SAPS frontend running at http://${host}:${port}`);
});
