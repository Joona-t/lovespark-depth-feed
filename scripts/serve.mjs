// Serve site/ on localhost. YouTube embeds refuse to play from file:// (no referrer), so open it through this.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const PORT = 8737;
createServer(async (req, res) => {
  try {
    const body = await readFile(new URL("../site/index.html", import.meta.url));
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(body);
  } catch {
    res.writeHead(500).end("Run `node scripts/build.mjs` first.");
  }
}).listen(PORT, "127.0.0.1", () => console.log(`Depth Feed on http://localhost:${PORT}`));
