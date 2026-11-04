// Contrast gate for every theme in site/template.html. Exits 1 if any text/background pair misses WCAG AA (4.5:1).
// Checks --ink, --muted and --accent on --panel, --chip, --bg and each solid colour in --page-bg; --accent-ink on
// --accent (Watch button); --bg on --ink (pressed tabs and chips). Run: node scripts/verify-themes.mjs
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../site/template.html", import.meta.url), "utf8");
const vars = (body) => Object.fromEntries([...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const themes = { light: vars(css.match(/:root \{([^}]*)\}/)[1]) };
for (const m of css.matchAll(/:root\[data-theme="([\w-]+)"\]\s*\{([^}]*)\}/g)) themes[m[1]] = vars(m[2]);

const lum = (hex) => {
  let h = hex.replace("#", "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

let fails = 0, pairs = 0;
for (const [name, v] of Object.entries(themes)) {
  const bgs = [["--panel", v["--panel"]], ["--chip", v["--chip"]], ["--bg", v["--bg"]],
    ...(v["--page-bg"]?.match(/#[0-9a-f]{3,6}\b/gi) || []).map((h) => ["--page-bg", h])];
  const checks = [...["--ink", "--muted", "--accent"].flatMap((t) => bgs.map(([b, bh]) => [t, v[t], b, bh])),
    ["--accent-ink", v["--accent-ink"], "--accent", v["--accent"]], ["--bg", v["--bg"], "--ink", v["--ink"]]];
  for (const [t, th, b, bh] of checks) {
    pairs++;
    const r = ratio(th, bh);
    if (r < 4.5) { fails++; console.log(`FAIL ${name}: ${t} ${th} on ${b} ${bh} = ${r.toFixed(2)}:1`); }
  }
}
console.log(`${Object.keys(themes).length} themes, ${pairs} pairs, ${fails} below 4.5:1`);
process.exit(fails ? 1 : 0);
