# Bugs and iterations

## 0.1.0 (2026-11-04): first version
- Crawled the HN Algolia API: 119,216 stories linking YouTube and 279,659 comments mentioning it, which link 248,242 distinct videos.
- Ranked by distinct recommenders + years recurring + story points; the top 10,000 checked via YouTube oEmbed, and the 8,000 live ones kept.
- Page: 6 fixed daily picks, mid-video thumbnails (`hq2.jpg`), nocookie embed with `rel=0`, local topic affinity.
- Known gaps: 57% of videos have no topic tag (keyword tagger); no durations (would need a YouTube Data API key).

## 0.2.0 (2026-11-04): signal-only feed
- Narrowed to four topics (AI, LLMs, Math, Robotics), matched on title + HN title + channel, plus a trusted list of teaching channels.
- Widened the candidate pool (≥2 recommenders or ≥10 points, 34,703 videos checked via oEmbed) so the narrower topics still get depth: 2,020 videos.
- Dropped news/mainstream channels and drama/hype/politics titles. Learning-shaped videos get a 1.6× rank boost and a badge.
- Fixes found by auditing random samples: "matrix", "prime", "proof", "statistics" and "drone" matched films, ads, car videos and war footage, so those terms were tightened or removed. Camel-cased channel names such as `LastWeekTonight` slipped past the news blocklist, so names are now also matched after splitting on case. Some oEmbed results have no channel name and crashed the build, so they now default to an empty name.
- Ads: the embedded player's ads can't be removed from the page; the README points to uBlock Origin.
