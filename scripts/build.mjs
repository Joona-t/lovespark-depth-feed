// Turn raw HN hits into a ranked video list, check each video still exists (YouTube oEmbed, no key),
// and bake the result into site/index.html.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

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

// Signal only: a video must land in one of these topics, matched on title + HN title + channel.
const TOPICS = {
  LLMs: /\b(llms?|large language models?|language models?|gpt[- ]?[1-5o]?|chatgpt|transformers?|attention is all|tokeni[sz]|rlhf|fine[- ]?tun|in[- ]context learning|nanogpt|llama|claude|scaling laws?)\b/i,
  AI: /\b(ai|a\.i\.|artificial intelligence|machine learning|deep learning|neural (net|network)s?|backprop\w*|gradient descent|reinforcement learning|diffusion models?|computer vision|convolutional|alpha(go|zero|fold)|deepmind|karpathy|hinton|lecun|bengio|sutskever|pytorch|tensorflow|jax|micrograd|autoencoders?|gans?|bayesian|statistical learning|kaggle)\b/i,
  Math: /\b(math(s|ematics|ematical|ematician)?|theorems?|calculus|algebra|geometry|topology|number theory|prime numbers?|riemann|fourier|probability|combinatorics|category theory|differential equations?|eigen\w*|linear algebra|integrals?|infinity|g[öo]del|manifolds?|group theory|graph theory|lambda calculus|3blue1brown|numberphile|mathologer|terence tao|grothendieck|euler)\b/i,
  Physics: /\b(physics|physicists?|quantum (mechanics|field|physics|computing|computers?|entanglement)|relativity|general relativity|black holes?|thermodynamics|entropy|electromagnet\w*|particle physics|higgs|standard model|string theory|cosmology|dark (matter|energy)|neutrinos?|feynman|maxwell'?s equations|schr[öo]dinger|lagrangian|hamiltonian|special relativity|lhc|cern|fusion (reactor|energy|power)|tokamak|superconduct\w*|astrophysics|gravitational waves?|optics)\b/i,
  Chemistry: /\b(chemistry|chemists?|chemical reactions?|periodic table|molecules?|molecular|organic chemistry|biochemistry|catalys[ti]s?|polymers?|electrochemi\w*|crystallograph\w*|synthesi[sz]ing|elements? \d+|isotopes?|oxidation|electrolysis|batter(y|ies) chemistry|nilered|periodic videos)\b/i,
  Biology: /\b(biology|biologists?|cells? biology|cellular|dna|rna|genes?|genetics?|genomes?|genomics|crispr|proteins?|protein folding|evolution(ary)? (biology|theory)|natural selection|neurons?|neuroscience|brain (science|research|cells?|structure|scan\w*|imaging)|microb(e|es|iology|iome)|bacteria|viruses?|immune system|immunology|enzymes?|mitochondria|ecology|embryo\w*|stem cells?|biochemistry|synthetic biology|alphafold)\b/i,
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
  "Julia Turc": ["AI", "LLMs"],
};
// Channels Joona follows by name. Not ranked by HN: their latest uploads come from YouTube's public RSS feed
// (no key), they skip the drama filter (his explicit pick) and show under the Following chip.
const FOLLOW = [
  { id: "UCCpNQKYvrnWQNjZprabMJlw", name: "Moonshots with Peter Diamandis", tags: ["AI"] },
  { id: "UCMUy_WsUIYbM_hKR9drb9dA", name: "Julia Turc", tags: ["AI", "LLMs"] },
  { id: "UCbRP3c757lWg9M-U7TyEkXA", name: "Theo - t3.gg", tags: ["AI"] },
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
  .filter(({ ch, text, tags }) => tags.length && !isNews(ch) && !NOISE.test(text))
  .map(({ x, title, ch, text, tags }) => {
    const learn = LEARNING.test(text) || ch in TRUSTED;
    return { x, title, ch, tags, learn, s: score(x) * (learn ? 1.6 : 1) };
  })
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
    out.push({ id, title, ch: f.name, yrs: [y, y], pub, tags, follow: f.lang ? undefined : true, lang: f.lang || undefined,
      learn: f.lang || LEARNING.test(title) || undefined, s: median });
    have.add(id); n++;
  }
  console.log(`follow ${f.name}: ${n} videos`);
}

const html = readFileSync("site/template.html", "utf8").replace("/*__DATA__*/[]", JSON.stringify(out).replace(/</g, "\\u003c"));
writeFileSync("site/index.html", html);
console.log(`wrote site/index.html with ${out.length} videos (${out.filter((x) => x.follow).length} from followed channels; ${ranked.length} HN candidates, the rest dead, off-topic or noise)`);
