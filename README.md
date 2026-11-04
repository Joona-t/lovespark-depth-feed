# Depth Feed

A personal YouTube feed made from the videos Hacker News keeps recommending, built to stop your attention getting hijacked. It's the same idea as Karpathy's HackerTube, rebuilt from public data.

- **Fixed daily picks.** You get 6 videos a day, and they don't change when you reload. Getting a different 6 takes a deliberate click.
- **Mid-video thumbnails.** Each thumbnail is YouTube's auto-generated middle frame (`hq2.jpg`), not the creator's A/B-tested one.
- **No YouTube sidebar.** Videos play in-page through `youtube-nocookie.com` with `rel=0`, so there's no autoplay chain or recommendation rail.
- **"Why" before "what".** Each card shows how many HN people linked the video, over how many years, and a real HN comment about it.
- **Signal only.** Seven topics: AI, LLMs, Math, Physics, Chemistry, Biology, Robotics. News and mainstream-media channels (CNN, BBC News, Bloomberg, late-night shows and so on) and drama/hype titles ("destroying", "shocking", "bubble", politics, stocks) are dropped at build time. Lectures, courses, explainers and teaching channels (3Blue1Brown, Karpathy, PBS Space Time, NileRed, Journey to the Microcosmos and others) rank 1.6× higher and get a **Learning** badge. All of these lists are in `scripts/build.mjs`: edit them, then rebuild.
- **Following.** The latest uploads (no Shorts) from channels you pick, here Moonshots with Peter Diamandis, Julia Turc and Theo (t3.gg), come from YouTube's public RSS feed and sit under their own chip. Edit `FOLLOW` in `scripts/build.mjs`.
- **Themes.** Holo Mochi by default, plus Seoul Y2K, Gingham Sticker, Neon Usagi, Light, Dark and Match my device. `node scripts/verify-themes.mjs` checks every theme's text contrast (WCAG AA).
- **Ads:** the page can't strip ads out of YouTube's embedded player. In a 3-video check YouTube showed none in this player anyway; if you do see some, LoveSpark's free [Pink Ad Blocker](https://github.com/Joona-t/lovespark-extensions/tree/main/privacy/lovespark-adblock) blocks them.
- **Learns locally.** Watching or saving a video nudges its topics up, and "Not for me" nudges them down. Everything lives in your browser's localStorage: no accounts, no data leaves your machine.

## Run

```
node scripts/serve.mjs
```
Then open http://localhost:8737. You need the local server because YouTube embeds won't play from `file://`.

## Rebuild the data

```
node scripts/fetch-hn.mjs   # crawl HN Algolia API -> data/*.jsonl (delete these files to re-crawl)
node scripts/build.mjs      # rank, check videos still exist via YouTube oEmbed, bake site/index.html
```
Neither step needs an API key. The ranking is in `scripts/build.mjs`: distinct HN commenters who linked the video, plus 2 × the number of extra years it kept coming up, plus 2 × ln(1 + story points).

## Credits

The idea, and the approach of mining HN for the videos it keeps recommending, come from [Andrej Karpathy](https://x.com/karpathy) and his [HackerTube](https://hackertube.org) weekend hack. This is an independent rebuild from public HN data, not his code or dataset. Thanks also to [Hacker News](https://news.ycombinator.com) commenters, whose links and words make up the feed, and to the [HN Algolia API](https://hn.algolia.com/api).

MIT licensed.
