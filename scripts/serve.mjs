import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const types = {".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".svg":"image/svg+xml", ".webp":"image/webp", ".xml":"application/xml", ".txt":"text/plain; charset=utf-8", ".webmanifest":"application/manifest+json"};
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const file = resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
    const rel = relative(root, file);
    if (rel.startsWith("..") || isAbsolute(rel) || !(await stat(file)).isFile()) throw new Error("not found");
    const bytes = await readFile(file);
    res.writeHead(200, {"Content-Type": types[extname(file)] || "application/octet-stream", "Cache-Control":"no-store", "X-Robots-Tag":"noindex, nofollow"});
    res.end(bytes);
  } catch {
    res.writeHead(404, {"Content-Type":"text/plain; charset=utf-8"});
    res.end("Not found");
  }
});
server.listen(4173, "127.0.0.1", () => console.log("Preview: http://127.0.0.1:4173"));
