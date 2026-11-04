// Pull every HN story and comment that links a YouTube video, via the free HN Algolia API.
// Output: data/stories.jsonl, data/comments.jsonl (one hit per line, only the fields we use).
import { mkdirSync, createWriteStream, existsSync, readFileSync } from "node:fs";

const API = "https://hn.algolia.com/api/v1/search_by_date";
const START = Date.UTC(2007, 0, 1) / 1000;
const END = Math.floor(Date.now() / 1000);
const PAGE_CAP = 1000; // Algolia returns at most 1000 hits per query

mkdirSync("data", { recursive: true });

async function get(params) {
  const url = `${API}?${new URLSearchParams(params)}`;
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res.json();
      if (attempt > 5) throw new Error(`${res.status} ${url}`);
    } catch (e) {
      if (attempt > 5) throw e;
    }
    await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
  }
}

// Recursively split [from, to) until each window fits in one 1000-hit page.
async function crawl(base, from, to, onHit) {
  const params = { ...base, hitsPerPage: PAGE_CAP, numericFilters: `created_at_i>=${from},created_at_i<${to}` };
  const res = await get(params);
  if (res.nbHits > PAGE_CAP && to - from > 60) {
    const mid = Math.floor((from + to) / 2);
    await crawl(base, from, mid, onHit);
    await crawl(base, mid, to, onHit);
    return;
  }
  res.hits.forEach(onHit);
}

async function run(name, queries, pick) {
  const path = `data/${name}.jsonl`;
  if (existsSync(path) && readFileSync(path, "utf8").length > 0) {
    console.log(`${path} exists, skipping`);
    return;
  }
  const out = createWriteStream(path);
  const seen = new Set();
  for (const base of queries) {
    let n = 0;
    await crawl(base, START, END, (h) => {
      if (seen.has(h.objectID)) return;
      seen.add(h.objectID);
      out.write(JSON.stringify(pick(h)) + "\n");
      if (++n % 5000 === 0) console.log(`${name} ${base.query}: ${n}`);
    });
    console.log(`${name} ${base.query}: done, ${n} new`);
  }
  out.end();
}

const common = { typoTolerance: "false" };

await run(
  "stories",
  ["youtube.com", "youtu.be"].map((q) => ({ ...common, query: q, tags: "story", restrictSearchableAttributes: "url" })),
  (h) => ({ id: h.objectID, t: h.created_at_i, url: h.url, title: h.title, points: h.points, nc: h.num_comments })
);

await run(
  "comments",
  ["youtube.com", "youtu.be"].map((q) => ({ ...common, query: q, tags: "comment" })),
  (h) => ({ id: h.objectID, t: h.created_at_i, by: h.author, text: h.comment_text, story: h.story_id })
);
