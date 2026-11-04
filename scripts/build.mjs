// Turn raw HN hits into a ranked video list, check each video still exists (YouTube oEmbed, no key),
// and bake the result into site/index.html.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

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
  .filter((x) => x.recommenders.size >= 2 || x.points >= 10)
  .sort((a, b) => score(b) - score(a));
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

// Earliest year HN first linked a video; older videos are dropped.
const MIN_YEAR = 2022;

// Signal only: a video must land in one of these topics, matched on title + HN title + channel.
const TOPICS = {
  LLMs: /\b(llms?|large language models?|language models?|gpt[- ]?[1-5o]?|chatgpt|transformers?|attention is all|tokeni[sz]|rlhf|fine[- ]?tun|in[- ]context learning|nanogpt|llama|claude|scaling laws?)\b/i,
  AI: /\b(ai|a\.i\.|artificial intelligence|machine learning|deep learning|neural (net|network)s?|backprop\w*|gradient descent|reinforcement learning|diffusion models?|computer vision|convolutional|alpha(go|zero|fold)|deepmind|karpathy|hinton|lecun|bengio|sutskever|pytorch|tensorflow|jax|micrograd|autoencoders?|gans?|bayesian|statistical learning|kaggle)\b/i,
  Math: /\b(math(s|ematics|ematical|ematician)?|theorems?|calculus|algebra|geometry|topology|number theory|prime numbers?|riemann|fourier|probability|combinatorics|category theory|differential equations?|eigen\w*|linear algebra|integrals?|infinity|g[öo]del|manifolds?|group theory|graph theory|lambda calculus|3blue1brown|numberphile|mathologer|terence tao|grothendieck|euler)\b/i,
  Physics: /\b(physics|physicists?|quantum (mechanics|field|physics|computing|computers?|entanglement)|relativity|general relativity|black holes?|thermodynamics|entropy|electromagnet\w*|particle physics|higgs|standard model|string theory|cosmology|dark (matter|energy)|neutrinos?|feynman|maxwell'?s equations|schr[öo]dinger|lagrangian|hamiltonian|special relativity|lhc|cern|fusion (reactor|energy|power)|tokamak|superconduct\w*|astrophysics|gravitational waves?|optics)\b/i,
  Chemistry: /\b(chemistry|chemists?|chemical reactions?|periodic table|molecules?|molecular|organic chemistry|biochemistry|catalys[ti]s?|polymers?|electrochemi\w*|crystallograph\w*|synthesi[sz]ing|elements? \d+|isotopes?|oxidation|electrolysis|batter(y|ies) chemistry|nilered|periodic videos)\b/i,
  Biology: /\b(biology|biologists?|cells? biology|cellular|dna|rna|genes?|genetics?|genomes?|genomics|crispr|proteins?|protein folding|evolution(ary)? (biology|theory)|natural selection|neurons?|neuroscience|brain (science|research|cells?|structure|scan\w*|imaging)|microb(e|es|iology|iome)|bacteria|viruses?|immune system|immunology|enzymes?|mitochondria|ecology|embryo\w*|stem cells?|biochemistry|synthetic biology|alphafold)\b/i,
  History: /\b(history of|historians?|ancient (rome|romans?|greece|greeks?|egypt\w*|china|persia)|roman (empire|republic)|medieval|middle ages|renaissance|industrial revolution|byzantine|ottoman|dynast(y|ies)|bronze age|iron age|archaeolog\w*|(1[0-9]th|20th) century|empires?|enlightenment)\b/i,
  "Computer Science": /\b(computer science|algorithms?|data structures?|compilers?|operating systems?|programming languages?|type systems?|distributed systems?|databases?|cryptograph\w*|complexity theory|turing machines?|recursion|dynamic programming|graph algorithms?|sorting|hash (tables?|maps?)|garbage collect\w*|concurrency|cs50|sicp|structure and interpretation)\b/i,
  Robotics: /\b(robots?|robotics?|boston dynamics|humanoids?|quadrupeds?|robot(ic)? (arms?|hands?)|self[- ]driving|autonomous (cars?|vehicles?|driving)|slam|kinematics|control theory|actuators?|legged)\b/i,
};
// Channels known for teaching these topics; their videos count even when the title says little.
const TRUSTED = {
  "3Blue1Brown": ["Math"], "Andrej Karpathy": ["AI", "LLMs"], "Numberphile": ["Math"], "Mathologer": ["Math"],
  "Welch Labs": ["AI", "Math"], "StatQuest with Josh Starmer": ["AI"], "Yannic Kilcher": ["AI", "LLMs"],
  "Steve Brunton": ["Math"], "Institute for Advanced Study": ["Math"], "Boston Dynamics": ["Robotics"],
  "Jeremy Howard": ["AI"], "Umar Jamil": ["LLMs"], "Google DeepMind": ["AI"], "Stanford Online": ["AI"],
  "PBS Space Time": ["Physics"], "minutephysics": ["Physics"], "Sixty Symbols": ["Physics"], "Fermilab": ["Physics"],
  "Veritasium": ["Physics"], "Physics Girl": ["Physics"], "Looking Glass Universe": ["Physics"], "Science Asylum": ["Physics"],
  "Periodic Videos": ["Chemistry"], "NileRed": ["Chemistry"], "Explosions&Fire": ["Chemistry"], "Applied Science": ["Physics"],
  "Tom's Lab": ["Chemistry"], "Journey to the Microcosmos": ["Biology"], "iBiology": ["Biology"], "HHMI BioInteractive": ["Biology"],
  "Artem Kirsanov": ["Biology"], "Crash Course": [], "Kurzgesagt – In a Nutshell": [], "Ninja Nerd": ["Biology"],
  "Fall of Civilizations": ["History"], "Historia Civilis": ["History"], "toldinstone": ["History"], "Extra History": ["History"],
  "Julia Turc": ["AI", "LLMs"], "CS50": ["Computer Science"], "MIT OpenCourseWare": [], "Alexander Amini": ["AI"],
};
// Full university courses (official playlists), listed with yt-dlp at build time. They're hand-picked, so they skip
// MIN_YEAR: a 2005 linear algebra course is still current.
const COURSES = [
  { id: "PLoROMvodv4rMqXOcazWaTUHhq-yembLCV", name: "Stanford Online", course: "Stanford CS336 Language Modeling from Scratch (2026)", tags: ["LLMs", "AI"] },
  { id: "PLaqpC4kq8Gpw", name: "Stanford Online", course: "Stanford CS229 Machine Learning (2026)", tags: ["AI", "Math"] },
  { id: "PLakGfbKCei80", name: "Stanford Online", course: "Stanford CME295 Transformers and LLMs (2026)", tags: ["LLMs", "AI"] },
  { id: "PLoROMvodv4rOCXd21gf0CF4xr35yINeOy", name: "Stanford Online", course: "Stanford CME295 Transformers and LLMs (2025)", tags: ["LLMs", "AI"] },
  { id: "PLoROMvodv4rMeDqwS1yFl3j3sR_-MQNEN", name: "Stanford Online", course: "Stanford CS221 Artificial Intelligence (2025)", tags: ["AI", "Computer Science"] },
  { id: "PLoROMvodv4rNRRGdS0rBbXOUGA0wjdh1X", name: "Stanford Online", course: "Stanford CS230 Deep Learning (2025)", tags: ["AI"] },
  { id: "PLoROMvodv4rOmsNzYBMe0gJY2XS8AQg16", name: "Stanford Online", course: "Stanford CS231N Deep Learning for Computer Vision (2025)", tags: ["AI"] },
  { id: "PLoROMvodv4rPwxE0ONYRa_itZFdaKCylL", name: "Stanford Online", course: "Stanford CS224R Deep Reinforcement Learning", tags: ["AI", "Robotics"] },
  { id: "PLoROMvodv4rNiJRchCzutFw5ItR_Z27CM", name: "Stanford Online", course: "Stanford CS25 Transformers United", tags: ["LLMs", "AI"] },
  { id: "PLhQjrBD2T381WAHyx1pq-sBfykqMBI7V4", name: "CS50", course: "Harvard CS50x", tags: ["Computer Science"] },
  { id: "PLhQjrBD2T381PopUTYtMSstgk-hsTGkVm", name: "CS50", course: "Harvard CS50 AI", tags: ["AI", "Computer Science"] },
  { id: "PLtBw6njQRU-rwp5__7C0oIVt26ZgjG9NI", name: "Alexander Amini", course: "MIT 6.S191 Deep Learning", tags: ["AI"] },
  { id: "PLUl4u3cNGP63oMNUHXqIUcrkS2PivhN3k", name: "MIT OpenCourseWare", course: "MIT 18.065 Matrix Methods for ML", tags: ["Math", "AI"] },
  { id: "PLE7DDD91010BC51F8", name: "MIT OpenCourseWare", course: "MIT 18.06 Linear Algebra", tags: ["Math"] },
  { id: "PLUl4u3cNGP61MdtwGTqZA0MreSaDybji8", name: "MIT OpenCourseWare", course: "MIT 6.041 Probability", tags: ["Math"] },
  { id: "PLUl4u3cNGP63EdVPNLG3ToM6LaEUuStEY", name: "MIT OpenCourseWare", course: "MIT 6.006 Algorithms", tags: ["Computer Science"] },
  { id: "PLUl4u3cNGP63gFHB6xb-kVBiQHYe_4hSi", name: "MIT OpenCourseWare", course: "MIT 6.034 Artificial Intelligence", tags: ["AI", "Computer Science"] },
  { id: "PLUl4u3cNGP61-9PEhRognw5vryrSEVLPr", name: "MIT OpenCourseWare", course: "MIT 8.04 Quantum Physics", tags: ["Physics"] },
  { id: "PLP8iPy9hna6Q2Kr16aWPOKE0dz9OnsnIJ", name: "The Julia Programming Language", course: "MIT 18.S191 Computational Thinking", tags: ["Math", "Computer Science"] },
];
// Channels Joona follows by name. Not ranked by HN: their latest uploads come from YouTube's public RSS feed
// (no key), they skip the drama filter (his explicit pick) and show under the Following chip.
const FOLLOW = [
  { id: "UCCpNQKYvrnWQNjZprabMJlw", name: "Moonshots with Peter Diamandis", tags: ["AI"] },
  { id: "UCMUy_WsUIYbM_hKR9drb9dA", name: "Julia Turc", tags: ["AI", "LLMs"] },
  { id: "UCbRP3c757lWg9M-U7TyEkXA", name: "Theo - t3.gg", tags: ["AI"] },
  { id: "UCcabW7890RKJzL968QWEykA", name: "CS50", tags: ["Computer Science"] },
  // Big university channels post on every subject: keep only uploads whose title matches a topic.
  { id: "UCBa5G_ESCn8Yd4vw5U-gIcg", name: "Stanford Online", tags: [], onTopic: true },
  { id: "UCEBb1b_L6zDS3xTUrIALZOw", name: "MIT OpenCourseWare", tags: [], onTopic: true },
  // History: latest uploads, under the History chip only (label shown on the card).
  { id: "UCT6Y5JJPKe_JDMivpKgVXew", name: "Fall of Civilizations", tags: ["History"], lang: true, label: "History channel" },
  { id: "UCv_vLHiWVBh_FR9vbeuiY-A", name: "Historia Civilis", tags: ["History"], lang: true, label: "History channel" },
  { id: "UCqBiWcuTF8IaLH7wBqnihsQ", name: "toldinstone", tags: ["History"], lang: true, label: "History channel" },
  { id: "UCCODtTcd5M1JavPCOr_Uydg", name: "Extra History", tags: ["History"], lang: true, label: "History channel" },
  // Language learning: latest uploads, tagged by language only (not under Following).
  { id: "UCBSyd8tXJoEJKIXfrwkPdbA", name: "Japanese Ammo with Misa", tags: ["Japanese"], lang: true },
  { id: "UCH88l3_ltyJm67gAFzDFNRw", name: "Nihongo con Teppei", tags: ["Japanese"], lang: true },
  { id: "UC2fAiRQHRQT9aj9P_ijYeow", name: "Mandarin Corner", tags: ["Mandarin"], lang: true },
  { id: "UCC_fdR7zZ_5SU--xuOrEdKw", name: "Grace Mandarin Chinese", tags: ["Mandarin"], lang: true },
  { id: "UCc5ueW8aqO73Q6MevB8L5PA", name: "Mandarin Blueprint", tags: ["Mandarin"], lang: true },
  { id: "UC5r3WHrX4Z7peSYpDlgktGw", name: "Talk To Me In Korean", tags: ["Korean"], lang: true },
  { id: "UCcA88_Z7wQWMoQ9bKwjuanA", name: "Korean Unnie", tags: ["Korean"], lang: true },
  { id: "UC7ynjArlSFuXW23ssZAknyA", name: "Go! Billy Korean", tags: ["Korean"], lang: true },
];
// No news, drama or hype: mainstream/news channels and attention-bait titles are dropped outright.
const NEWS_CHANNEL = /\b(cnn|fox (news|business)|msnbc|cnbc|bbc news|sky news|abc news|nbc news|cbs (news|mornings)|60 minutes|al jazeera|bloomberg|reuters|associated press|guardian news|new york times|wall street journal|wsj|washington post|vice( news)?|vox|business insider|insider|cnet|the verge|tmz|young turks|daily show|last week tonight|jimmy kimmel|late show|tonight show|good morning america|pbs newshour|dw news|france 24|euronews|wion|forbes|fortune|yahoo finance|channel 4 news|lbc|piers morgan|the economist|tldr news|cold fusion|coldfusion|hbo|ign|prime video|not just bikes|y combinator|more perfect union|adult swim|dyson|steve lehto|excerpts4u)\b/i;
// "LastWeekTonight" -> "Last Week Tonight", so camel-cased channel names match too.
const isNews = (ch) => NEWS_CHANNEL.test(ch) || NEWS_CHANNEL.test(ch.replace(/([a-z])([A-Z])/g, "$1 $2"));
const NOISE = /\b(drama|exposed|scandal|shocking|insane|won'?t believe|breaking|reacts?|reaction|destroy\w*|worst|killer\w*|slop|slams?|meltdown|is dead|is over|doomed|panic|crisis|outrage|fired|lawsuit|sues|elon|musk|trump|biden|election|senate|congress|hearing|testif\w*|stock|crypto|bitcoin|earnings|hype|ceo|funding|billion|layoffs?|apocalypse|terrifying|scary|will kill|your job|replace (you|us|programmers)|end of humanity|godfather of ai warns|bubble|war|military|weapons?|ukraine|russia\w*|petition|sanders|robot chicken|dangerous|the lie|the truth about|arrested)\b/i;
const WAR = /\b(war|military|weapons?|ukraine|russia\w*)\b/gi;
// Learning-shaped videos (lectures, courses, explainers, builds) rank higher.
const LEARNING = /\b(lectures?|course|tutorial|explained|explain\w*|from scratch|introduction|intro to|lessons?|class|seminar|workshop|walkthrough|deep dive|let'?s build|derivation|visuali[sz]\w*|intuition|how .+ works|paper|cs ?\d{3}|mit|stanford|berkeley|cmu|caltech|oxford|cambridge|ocw)\b/i;
const topics = (t, ch) => [...new Set([...Object.entries(TOPICS).filter(([, re]) => re.test(t)).map(([k]) => k), ...(TRUSTED[ch] || [])])];

const out = ranked
  .filter((x) => cache[x.id])
  .map((x) => {
    const { title, author: ch = "" } = cache[x.id];
    const text = `${title} ${x.hnTitle || ""} ${ch}`;
    return { x, title, ch, text, tags: topics(text, ch) };
  })
  // History is about wars and empires, so for History-only videos the war/military words don't count as noise.
  .filter(({ ch, text, tags }) => tags.length && !isNews(ch) &&
    !(tags.every((t) => t === "History") ? NOISE.test(text.replace(WAR, "")) : NOISE.test(text)))
  .map(({ x, title, ch, text, tags }) => ({ x, title, ch, tags, learn: LEARNING.test(text) || ch in TRUSTED }))
  // Learning + depth only, and current: oEmbed has no upload date, so the year HN first linked a video stands in for it.
  .filter(({ x, learn }) => learn && Math.min(...x.years) >= MIN_YEAR)
  .map(({ x, title, ch, tags, learn }) => ({ x, title, ch, tags, learn, s: score(x) }))
  .sort((a, b) => b.s - a.s)
  .map(({ x, title, ch, tags, learn, s }) => {
    const ys = [...x.years].sort();
    return {
      id: x.id,
      title,
      ch,
      hn: x.hnTitle && x.hnTitle !== title ? x.hnTitle : undefined,
      rec: x.recommenders.size,
      pts: x.points,
      yrs: [ys[0], ys.at(-1)],
      story: x.stories[0],
      q: x.quote ? { t: x.quote.text, by: x.quote.by, id: x.quote.id } : undefined,
      tags,
      learn: learn || undefined,
      s: Math.round(s * 10) / 10,
    };
  });

// Following and languages: latest uploads per channel from the RSS feed. Shorts are dropped (the feed links them as /shorts/).
const median = out.length ? out[Math.floor(out.length / 2)].s : 10;
const have = new Set(out.map((x) => x.id));
for (const f of FOLLOW) {
  let xml = "";
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${f.id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    xml = await res.text();
  } catch (e) { console.log(`follow ${f.name}: feed failed (${e.message}), skipped`); continue; }
  let n = 0;
  for (const [, entry] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const id = entry.match(/<yt:videoId>([\w-]{11})</)?.[1];
    const title = decode(entry.match(/<title>([^<]*)</)?.[1] || "");
    const y = +(entry.match(/<published>(\d{4})/)?.[1] || new Date().getUTCFullYear());
    const pub = entry.match(/<published>([\d-]{10})/)?.[1];
    if (!id || entry.includes("/shorts/")) continue;
    if (have.has(id)) { if (!f.lang) out.find((x) => x.id === id).follow = true; continue; }
    const tags = f.lang ? f.tags : [...new Set([...topics(title, ""), ...f.tags])];
    if (f.onTopic && !tags.length) continue;
    out.push({ id, title, ch: f.name, yrs: [y, y], pub, tags, follow: f.lang ? undefined : true, lang: f.lang || undefined, lab: f.label,
      learn: f.lang || LEARNING.test(title) || undefined, s: median });
    have.add(id); n++;
  }
  console.log(`follow ${f.name}: ${n} videos`);
}

for (const c of COURSES) {
  let lines = [];
  try {
    lines = execFileSync("yt-dlp", ["--flat-playlist", "--print", "%(id)s\t%(title)s", `https://www.youtube.com/playlist?list=${c.id}`],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 120000 }).trim().split("\n");
  } catch (e) { console.log(`course ${c.course}: yt-dlp failed or missing (${e.code || e.message}), skipped`); continue; }
  let n = 0;
  lines.forEach((line, i) => {
    const [id, title] = line.split("\t");
    if (!/^[\w-]{11}$/.test(id) || /^\[(private|deleted)/i.test(title)) return;
    const prev = out.find((x) => x.id === id);
    if (prev) { prev.course = c.course; return; }
    out.push({ id, title, ch: c.name, course: c.course, part: i + 1, tags: c.tags, learn: true, s: median });
    have.add(id); n++;
  });
  console.log(`course ${c.course}: ${n} videos`);
}

const html = readFileSync("site/template.html", "utf8").replace("/*__DATA__*/[]", JSON.stringify(out).replace(/</g, "\\u003c"));
writeFileSync("site/index.html", html);
console.log(`wrote site/index.html with ${out.length} videos (${out.filter((x) => x.follow).length} from followed channels; ${ranked.length} HN candidates, the rest dead, off-topic or noise)`);
