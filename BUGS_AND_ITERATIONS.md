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

## 0.3.0 (2026-11-04): science topics, followed channels, Korean themes
- Added Physics, Chemistry and Biology topics with trusted teaching channels: 2,949 videos (752 Physics, 147 Biology, 72 Chemistry).
- Following chip: latest uploads from Moonshots, Julia Turc and Theo via YouTube RSS (no key), Shorts dropped. These skip the drama filter because Joona picked them.
- Themes: the four Korean themes from Raw Thought reader, Holo Mochi as the default; "Match my device" is now a saved choice so the default doesn't override it. New `scripts/verify-themes.mjs` contrast gate: 6 themes, 114 pairs, all ≥4.5:1.
- Fixes found by sampling: bare "brain" matched self-help talks (now brain science/research/imaging only); Applied Science (engineering) flooded Chemistry, so it's Physics only; the first lookup grabbed the wrong channel ID for Theo (feed stopped in 2024), now UCbRP3c757lWg9M-U7TyEkXA; the light theme's accent on chips was 4.16:1, darkened to pass; the selected chip's count was invisible.
- Ads: a 3-video check of the embedded player saw no ads with or without a blocker; the README now points to LoveSpark's Pink Ad Blocker instead of uBlock Origin.


## 0.4.0 (2026-11-04): language channels, no ad notes
- Japanese, Mandarin and Korean chips from 8 learning channels via RSS (27 / 26 / 21 videos). Channel IDs come from each page's canonical link and were checked against the feed's channel name.
- Removed the ad-blocker notes from the page, README and NEXT.md: Joona already runs a blocker in Chrome.
- Fix: the Shorts filter never fired. It sent a HEAD request to /shorts/<id>, which apparently never returned 200 to Node, so every Short was kept (12 of Korean Unnie's 15 feed entries). The feed itself links Shorts as /shorts/, so that link is now the check.

## 0.5.0 (2026-11-04): learning-only, current videos
- Joona saw an SNL sketch in his picks and wants only current, learning-shaped videos. HN videos must now be learning-shaped (lecture, course, explainer, or a trusted teaching channel) and first linked on HN in 2022 or later (`MIN_YEAR` in `scripts/build.mjs`; oEmbed has no upload date, so first-HN-year stands in). 2,949 → 473 videos. Followed and language channels are unchanged.
- Root cause of the SNL pick: being learning-shaped only boosted a video's rank, it was never required, so any on-topic video (here "robots" in a comment-driven HN title) could show up.

## 0.6.0 (2026-11-04): university courses, Computer Science, History
- Full official course playlists, listed with yt-dlp at build time (YouTube changed its playlist page markup, so parsing it directly found 0 videos): Harvard CS50x 2024 and CS50 AI, MIT 6.S191 Deep Learning, 18.06 Linear Algebra, 18.065 Matrix Methods for ML, 6.041 Probability, 6.006 Algorithms, 6.034 AI, 8.04 Quantum Physics, 18.S191 Computational Thinking (10 courses, 349 lectures). Courses skip MIN_YEAR since they're hand-picked. Each playlist ID was checked to be the official uploader's; YouTube search mostly returned third-party re-uploads.
- CS50 channel added to Following. New Computer Science topic (172) and History topic (61) with Fall of Civilizations, Historia Civilis, toldinstone and Extra History by RSS.
- History videos are about wars and empires, so for History-only videos the war/military words no longer count as noise. Sampling showed bare "civilizations" matched space videos, so it was dropped.
- 910 videos total.

## 0.7.0 (2026-11-04): Stanford courses, Stanford Online and MIT OCW followed
- Nine official Stanford Online playlists (163 lectures): CS336 Language Modeling from Scratch 2026, CS229 ML 2026, CME295 Transformers & LLMs 2025 and 2026, CS221 AI 2025, CS230 Deep Learning 2025, CS231N 2025, CS224R Deep RL, CS25 Transformers United. Newer playlists have short IDs (e.g. `PLaqpC4kq8Gpw`); checked with yt-dlp that they are real and official.
- Stanford Online and MIT OpenCourseWare added to Following with `onTopic: true`: they post on every subject, so only uploads whose title matches a topic are kept. MIT OCW's current 15 are a grad-school skills series, so 0 for now.
- 1,083 videos total.
