// Turn raw HN hits into a ranked video list, check each video still exists (YouTube oEmbed, no key),
// and bake the result into site/index.html.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const MAX_VIDEOS = 8000;
const ID_RE = /(?:youtube\.com\/(?:watch\?(?:[^"\s<>]*?&(?:amp;)?)?v=|embed\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/g;

const decode = (s = "") =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const plain = (html) => decode(html.replace(/<p>/g, " ").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
const ids = (text) => [...new Set([...decode(text).matchAll(ID_RE)].map((m) => m[1]))];
const lines = (p) => readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));

const videos = new Map();
const v = (id) => {
  if (!videos.has(id)) videos.set(id, { id, points: 0, stories: [], recommenders: new Set(), years: new Set(), quote: null, hnTitle: null });
  return videos.get(id);
};
const year = (t) => new Date(t * 1000).getUTCFullYear();

for (const s of lines("data/stories.jsonl")) {
  for (const id of ids(s.url || "")) {
    const x = v(id);
    x.points += s.points || 0;
    x.stories.push(s.id);
    x.years.add(year(s.t));
    if (!x.hnTitle || (s.points || 0) > x.bestPoints) { x.hnTitle = s.title; x.bestPoints = s.points || 0; }
  }
}

for (const c of lines("data/comments.jsonl")) {
  const found = ids(c.text || "");
  if (found.length > 3) continue; // link dumps say little about any one video
  for (const id of found) {
    const x = v(id);
    if (x.recommenders.has(c.by)) continue;
    x.recommenders.add(c.by);
    x.years.add(year(c.t));
    const q = plain(c.text);
    if (q.length > 60 && q.length < 600 && (!x.quote || q.length > x.quote.text.length)) x.quote = { text: q, by: c.by, id: c.id };
  }
}

// "Keeps being recommended": distinct people, across distinct years, plus front-page interest.
const score = (x) => x.recommenders.size + 2 * (x.years.size - 1) + 2 * Math.log1p(x.points);
const ranked = [...videos.values()]
  .filter((x) => x.recommenders.size >= 3 || x.points >= 40)
  .sort((a, b) => score(b) - score(a))
  .slice(0, Math.round(MAX_VIDEOS * 1.25));
console.log(`${videos.size} distinct videos linked, ${ranked.length} candidates`);

// oEmbed cache so reruns only fetch new ids.
const CACHE = "data/oembed.json";
const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, "utf8")) : {};
const todo = ranked.filter((x) => !(x.id in cache));
let done = 0;
async function worker() {
  while (todo.length) {
    const x = todo.pop();
    try {
      const res = await fetch(`https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${x.id}`);
      cache[x.id] = res.ok ? (({ title, author_name }) => ({ title, author: author_name }))(await res.json()) : null;
    } catch {
      continue; // network blip: leave uncached, retry next run
    }
    if (++done % 500 === 0) { console.log(`oembed ${done}`); writeFileSync(CACHE, JSON.stringify(cache)); }
  }
}
await Promise.all(Array.from({ length: 12 }, worker));
writeFileSync(CACHE, JSON.stringify(cache));

const TOPICS = {
  "AI & ML": /\b(ai|a\.i\.|machine learning|neural|deep learning|gpt|llm|transformer|karpathy|reinforcement|diffusion)\b/i,
  Programming: /\b(programming|code|coding|compiler|rust|python|haskell|lisp|javascript|c\+\+|golang|software|unix|linux|git|database|sql|vim|emacs|algorithm|functional|type system|debugg)/i,
  Math: /\b(math|mathematics|theorem|proof|calculus|algebra|geometry|topology|numberphile|3blue1brown|prime|equation|fourier)/i,
  Physics: /\b(physics|quantum|relativity|particle|cosmolog|black hole|thermodynamic|fusion|feynman)/i,
  Space: /\b(space|nasa|spacex|rocket|mars|moon|orbit|apollo|satellite|telescope|starship|asteroid)/i,
  Hardware: /\b(cpu|chip|semiconductor|transistor|fpga|electronics|circuit|hardware|arduino|6502|z80|risc|processor|silicon|soldering|oscilloscope)/i,
  Engineering: /\b(engineering|engine|machining|manufactur|factory|bridge|mechanical|lathe|cnc|3d print|aircraft|airplane|jet)/i,
  History: /\b(history|historical|19\d\ds|ancient|war|documentary|vintage|retro|archive)/i,
  Security: /\b(security|hack|hacking|exploit|defcon|def con|ccc|crypto(graphy)?|vulnerab|reverse engineer)/i,
  Biology: /\b(biology|cell|dna|gene|evolution|brain|neuro|protein|virus|medicine|medical)/i,
  Talks: /\b(talk|lecture|keynote|conference|strange loop|gdc|interview|podcast|course|class)/i,
  Music: /\b(music|song|album|synth|concert|guitar|piano|composer|band)\b/i,
  Games: /\b(game|gaming|speedrun|nintendo|doom|minecraft|demoscene)/i,
};
const topics = (t) => Object.entries(TOPICS).filter(([, re]) => re.test(t)).map(([k]) => k);

const out = ranked
  .filter((x) => cache[x.id])
  .slice(0, MAX_VIDEOS)
  .map((x) => {
    const title = cache[x.id].title;
    const text = `${title} ${x.hnTitle || ""} ${cache[x.id].author}`;
    const ys = [...x.years].sort();
    return {
      id: x.id,
      title,
      ch: cache[x.id].author,
      hn: x.hnTitle && x.hnTitle !== title ? x.hnTitle : undefined,
      rec: x.recommenders.size,
      pts: x.points,
      yrs: [ys[0], ys.at(-1)],
      story: x.stories[0],
      q: x.quote ? { t: x.quote.text, by: x.quote.by, id: x.quote.id } : undefined,
      tags: topics(text),
      s: Math.round(score(x) * 10) / 10,
    };
  });

const html = readFileSync("site/template.html", "utf8").replace("/*__DATA__*/[]", JSON.stringify(out).replace(/</g, "\\u003c"));
writeFileSync("site/index.html", html);
console.log(`wrote site/index.html with ${out.length} videos (${ranked.length - out.length} dead or skipped)`);
