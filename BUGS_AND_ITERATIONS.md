# Bugs and iterations

## 0.1.0 (2026-11-04): first version
- Crawled the HN Algolia API: 119,216 stories linking YouTube and 279,659 comments mentioning it, which link 248,242 distinct videos.
- Ranked by distinct recommenders + years recurring + story points; the top 10,000 checked via YouTube oEmbed, and the 8,000 live ones kept.
- Page: 6 fixed daily picks, mid-video thumbnails (`hq2.jpg`), nocookie embed with `rel=0`, local topic affinity.
- Known gaps: 57% of videos have no topic tag (keyword tagger); no durations (would need a YouTube Data API key).
