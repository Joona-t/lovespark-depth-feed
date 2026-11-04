# Pick up where you left off

Last session: 2026-11-04, on the PC. Current state: a signal-only feed (AI, LLMs, Math, Robotics) of 2,020 videos, with no news or drama. Learning videos rank higher.

## On the Mac

```bash
git clone https://github.com/Joona-t/lovespark-depth-feed.git
cd lovespark-depth-feed
node scripts/serve.mjs        # then open http://localhost:8737
```
The feed works straight away because `site/index.html` already has the videos built in. The raw HN crawl (`data/*.jsonl`, 225 MB) isn't in git, so before changing filters and rebuilding, run `node scripts/fetch-hn.mjs` once. It takes about 15 minutes and needs no API key. `data/oembed.json` is in git, so the rebuild after that is quick.

## Suggested next step: block YouTube ads

The page can't remove ads from YouTube's embedded player. Only a browser ad blocker can.

1. **Firefox (most reliable):** install [uBlock Origin](https://addons.mozilla.org/firefox/addon/ublock-origin/) and leave the default filter lists on.
2. **Chrome:** full uBlock Origin no longer runs on Chrome (it needs Manifest V2). [uBlock Origin Lite](https://chromewebstore.google.com/detail/ublock-origin-lite/ddkjiahejlhfcafbddmgiahcphecmpfh) is the Manifest V3 version. How well it blocks YouTube embed ads is untested here.
3. **Safari:** try an open-source content blocker, or open the feed in Firefox.
4. **Check it:** play a few long videos from big channels (they're the most likely to have ads) and see whether any pre-roll ads appear.

## Other ideas from this session

- **Video lengths:** this needs a free YouTube Data API key from Google Cloud (you have to create it yourself). With lengths, the feed could favour long lectures and hide anything under 5 minutes.
- **Better topic tagging:** run a local model over titles instead of keyword regexes, which would catch the few loosely related videos (for example game-AI clips) that still get through.
- **Fresh videos:** re-run the crawl monthly so new HN-recommended videos show up.
- **Your own tuning:** the topic, trusted-channel, news and noise lists are at the top of `scripts/build.mjs`.
