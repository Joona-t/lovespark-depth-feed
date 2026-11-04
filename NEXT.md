# Pick up where you left off

Last session: 2026-11-04, on the Mac (0.3.0). Current state: a signal-only feed of 2,949 videos across AI, LLMs, Math, Physics, Chemistry, Biology and Robotics, plus a Following chip (Moonshots, Julia Turc, Theo via RSS), with no news or drama. Learning videos rank higher. Holo Mochi is the default theme.

## On the Mac

```bash
git clone https://github.com/Joona-t/lovespark-depth-feed.git
cd lovespark-depth-feed
node scripts/serve.mjs        # then open http://localhost:8737
```
The feed works straight away because `site/index.html` already has the videos built in. The raw HN crawl (`data/*.jsonl`, 225 MB) isn't in git, so before changing filters and rebuilding, run `node scripts/fetch-hn.mjs` once. It takes about 15 minutes and needs no API key. `data/oembed.json` is in git, so the rebuild after that is quick.

## Other ideas from this session

- **Video lengths:** this needs a free YouTube Data API key from Google Cloud (you have to create it yourself). With lengths, the feed could favour long lectures and hide anything under 5 minutes.
- **Better topic tagging:** run a local model over titles instead of keyword regexes, which would catch the few loosely related videos (for example game-AI clips) that still get through.
- **Fresh videos:** re-run the crawl monthly so new HN-recommended videos show up.
- **Your own tuning:** the topic, trusted-channel, news and noise lists are at the top of `scripts/build.mjs`.
- **Tweets:** will be its own tool, not part of Depth Feed (Joona, 2026-11-04).
