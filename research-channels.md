# Depth Feed: missing channels and course playlists (research, 2026-11-04)

Research only. Nothing in `scripts/build.mjs` was changed.

**Verdict:** I ran about 145 channel lookups (roughly 125 resolved to a live feed) and about 50 playlist checks against live YouTube today. About 60 are strong adds. The rejects are listed below with the reason. Already in the feed or being added (left out here): everything in `TRUSTED`/`FOLLOW`/`COURSES` as of today, Stanford Online, MIT OpenCourseWare, and the Stanford CS336/CS229/CS221/CS224R/CME295/CS230/CS231N/CS25 playlists.

## Method

- **Channel ID:** `<link rel="canonical">` on `https://www.youtube.com/@HANDLE`. When a handle 404'd, I took the ID from YouTube's channel-filtered search (`sp=EgIQAg%3D%3D`) and checked it against the feed's channel name.
- **Feed check:** `https://www.youtube.com/feeds/videos.xml?channel_id=ID`. I recorded the feed `<title>` (this is also the oEmbed `author_name` that `TRUSTED` keys must match), the newest `<published>` date, and how many of the entries are long-form.
  - Long-form vs Short is decided by each entry's `<link rel="alternate">` only (`watch?v=` vs `/shorts/`). A plain grep for `watch?v=` over-counts: Shorts descriptions often contain `watch?v=` links. My first pass made this mistake, and the numbers here are from the corrected pass.
  - `build.mjs` already drops `/shorts/` entries (`scripts/build.mjs:198`), so a 50%-Shorts channel still gives about 7 videos per build. I still rejected channels at 5/15 long-form or fewer, as the brief asked.
- **Playlists:** `yt-dlp --flat-playlist --playlist-items 1 --print "%(playlist_title)s | %(playlist_uploader)s | %(playlist_count)s"`. I kept only playlists whose uploader is the official channel. Several search hits were re-uploads, and they are listed under Rejected.
- **Inactive cutoff:** the last upload must be after 2024-11-04 (2 years before today), unless the channel or playlist is a finished classic course.
- **Script:** `verify.py` in the session scratchpad (not committed). Raw results were printed to the session log.

## Sources

- **Own knowledge:** most entries. Every one was then verified as described above.
- [Migaku, Best Japanese YouTube channels (2026)](https://migaku.com/blog/japanese/best-japanese-youtube-channels): Comprehensible Japanese, Japanese with Shun, Speak Japanese Naturally, Nihongo no Mori, Sambon Juku.
- [Discover Discomfort, Comprehensible Mandarin channels](https://discoverdiscomfort.com/?p=18549): Lazy Chinese, Xiaogua, Chloe Chinese Class, Mandarin Click, Story Learning Chinese with Annie.
- [Bunpro community, comprehensible input thread](https://community.bunpro.jp/t/comprehensible-input/202553): a search-result snippet said Yuki left CIJ and now runs にほんごのじかん. Unverified beyond that snippet.
- **r/math "math youtube channel recommendations"** ([mirror](https://reddit.birdcat.cafe/r/math/comments/1j4n06e/math_youtube_channel_recommendations), 2025-03): the page returned HTTP 403, so I only have the search snippet. It names Trefor Bazett and The Math Sorcerer, and one commenter says Numberphile is not aimed at mathematicians.
- [PhysicsForums, top math/physics creators](https://www.physicsforums.com/threads/who-are-the-top-math-physics-content-creators-on-youtube-and-beyond.990537/): Professor Leonard, Gilbert Strang, Catsters.
- [LessWrong, A Layman's Guide to Recreational Mathematics Videos](https://www.lesswrong.com/posts/MZHgJwJD7jR4REFDP/a-layman-s-guide-to-recreational-mathematics-videos): Trefor Bazett, plus the recreational-maths set (Stand-up Maths and similar).
- **Generic "top AI channels" listicles** (Analytics Vidhya, tech.co): these mostly repeat 3Blue1Brown, Karpathy, StatQuest, sentdex, DeepLearning.AI and Two Minute Papers. That is low-signal and SEO-driven, so I used them only to confirm consensus.
- **Hacker News:** an Algolia search for Ask HN threads on learning channels found only small or old threads (largest: [26364504](https://news.ycombinator.com/item?id=26364504), 35 comments, 2021). No HN source is cited per row.

## Where sources agree

- **Comprehensible input dominates the language lists.** Comprehensible Japanese / にほんごのじかん and Lazy Chinese come up first in every language list. Mandarin Corner, TTMIK and Go Billy, which the feed already has, are the other consensus picks.
- **University-level maths:** forum and Reddit lists agree on full-length lecturers (Professor Leonard, Strang, Bazett) over recreational channels. Numberphile is called pop-level.
- **ML:** every list names Karpathy, 3Blue1Brown and StatQuest (all already in the feed). Researcher-run channels (Neel Nanda, GPU MODE, Neubig, HAN Lab, Jia-Bin Huang) don't show up in the listicles. They come from own knowledge, and they are the gap that matters for current techniques.
- **The "popular" AI channels are risky:** Two Minute Papers and AI Explained appear on many lists but are paper-hype or news, which the feed excludes by design.

## Side finding

3Blue1Brown's feed is currently 4/15 long-form (11 Shorts). This is harmless: it sits in `TRUSTED`, not `FOLLOW`, so its videos only arrive through HN ranking.

---

## 1. ML / AI / LLMs

### Channels

| Name (feed title) | Handle | Channel ID | Why it signals depth | Latest | Long/15 | Source | Risk |
|---|---|---|---|---|---|---|---|
| GPU MODE | @GPUMODE | UCJgIbYl6C5no72a0NUAPcTA | Hour-long CUDA/Triton/kernel lectures by practitioners, current LLM systems work | 2026-10-24 | 15/15 | own knowledge | none |
| Neel Nanda | @neelnanda2469 | UCBMJ0D-omcRay8dh4QT0doQ | Mechanistic interpretability walkthroughs and paper reads by a DeepMind lead | 2026-10-04 | 15/15 | own knowledge | none |
| Jia-Bin Huang | @jbhuang0604 | UCkQS_dP6GJTmYnMlox-YiKQ | Clear explainers of current vision and generative methods (diffusion, flow matching) by a professor | 2026-11-03 | 15/15 | own knowledge | none |
| Graham Neubig | @neubig | UC2JCYhib8HojEIBWFmH5g7A | Full CMU NLP and LLM-inference courses, current | 2026-10-19 | 15/15 | own knowledge | none |
| MIT HAN Lab | @MITHANLab | UCcA-9WYwGaUrWiZaEDo84ng | MIT 6.5940 EfficientML lectures plus quantization/sparsity paper talks | 2026-11-04 | 15/15 | own knowledge | Paper-demo clips mixed in; prefer the course playlist |
| Gabriel Mongaras | @gabrielmongaras | UCYUq87t77YNTG5m256fOXeQ | Long line-by-line paper walkthroughs (attention variants, SSMs) | 2026-01-22 | 15/15 | own knowledge | Irregular cadence |
| Simons Institute for the Theory of Computing | @SimonsInstitute | UCW1C2xOfXsIzPgjXyuhkw9g | Research workshop talks (LLM theory, learning theory, cryptography) | 2026-11-04 | 15/15 | own knowledge | Very high volume, research-level; better as TRUSTED than FOLLOW |
| Carnegie Mellon University Deep Learning | (no handle) | UC8hYZGEkI2dDO8scT8C5UQA | Official CMU 11-785 lectures, recitations and bootcamps | 2026-11-04 | 15/15 | own knowledge | Mostly recitations and labs; use the lecture playlist |
| Princeton Language & Intelligence | (no handle) | UCg5WgOsGFM42nql_OqcORRg | Princeton PLI research talks on LLMs | 2025-09-18 | 15/15 | own knowledge | Slowing down |
| AI Coffee Break with Letitia | @AICoffeeBreak | UCobqgqE4i5Kf7wrxRxhToQA | PhD-run paper explainers on transformers and multimodal models | 2026-09-27 | 7/15 | own knowledge | 8/15 Shorts (dropped by the build) |
| Mutual Information | @Mutual_Information | UCCcrR0XBH0aWbdffktUBEdw | Rigorous probability and RL explainers | 2025-12-10 | 14/15 | own knowledge | Rare uploads |
| Algorithmic Simplicity | @algorithmicsimplicity | UC3sH8ShnMyB5MxavG1DaklA | First-principles explainers of transformers, diffusion and CNNs | 2026-09-22 | 7/8 | own knowledge | Only 8 videos in the feed |
| Luis Serrano Academy | @SerranoAcademy | UCgBncpylJ1kiVaPyP-PZauQ | Gentle, mathematically honest ML and LLM explainers | 2026-10-27 | 12/15 | own knowledge | Some course promotion |
| Sebastian Raschka | @SebastianRaschka | UC_CzsS7UTjcxJ-xXp1ftxtA | Build-an-LLM-from-scratch code walkthroughs | 2026-10-17 | 6/15 | own knowledge | 9/15 Shorts; book promotion |
| Hugging Face | @HuggingFace | UCHlNU7kIZhRgSbhHvFoy72w | Open-model courses and library walkthroughs | 2026-10-29 | 13/15 | own knowledge | Partly product marketing |
| Aleksa Gordić - The AI Epiphany | @TheAIEpiphany | UCj8shE7aIn4Yawwbo2FceCQ | Long paper and code deep dives | 2025-05-05 | 15/15 | own knowledge | Quiet for 18 months |
| Samuel Albanie | @SamuelAlbanie1 | UCMtxPy2z1qzwvP7wiarkoaw | Careful, sourced lectures on foundation models | 2025-01-05 | 15/15 | own knowledge | Quiet for 22 months |
| Edan Meyer | @EdanMeyer | UC66Ggxy8MHX9DCDohdRYDTA | RL research explainers by an RL PhD student | 2025-10-13 | 15/15 | own knowledge | Some opinion videos |
| Alfredo Canziani (冷在) | @alfcnz | UCupQLyNchb9-2Z5lmUOIijw | NYU Deep Learning (with LeCun) lecturer | 2026-07-27 | 8/15 | own knowledge | 7/15 Shorts |
| Sasha Rush | @srush_nlp | UCCnH8mxROOqii6gesCmMRzQ | Cornell professor; LLM-reasoning and systems talks | 2025-09-02 | 5/15 | own knowledge | Mostly Shorts lately |
| Vizuara | @vizuara | UCdEov4L0bpJ_h6W3sJxkfUA | Long from-scratch LLM and SciML lecture series | 2026-11-04 | 14/15 | own knowledge | Very prolific and uneven; course upsell |
| sentdex | @sentdex | UCfzlCWGWYyIQ0aLC5w48gBQ | Practical builds (Python, local models) | 2026-10-18 | 15/15 | listicles | Drifts into hardware and gadget content |
| Machine Learning Street Talk | @MachineLearningStreetTalk | UCMLtBahI5DMrt0NPvDSoIRQ | Long research interviews | 2026-11-04 | 3/15 | own knowledge | **Reject:** 12/15 Shorts; AGI-debate hype drift |
| Dwarkesh Patel | @DwarkeshPatel | UCXl4i9dYBrFOabk0xGmbkRA | Long interviews with researchers | 2026-11-03 | 3/15 | own knowledge | **Reject:** 12/15 Shorts; forecasting and hype framing |
| Two Minute Papers | @twominutepapers | UCbfYPyITQ-7l4upoX8nvctg | Paper highlights | 2026-10-30 | 15/15 | listicles | **Reject:** hype register, shallow |
| AI Explained | @aiexplained-official | UCNJ1Ymd5yFuUPtn21xtRbbw | Model-release analysis | 2026-11-02 | 15/15 | own knowledge | **Reject:** AI news |
| DeepLearningAI | @DeepLearningAI | UCcIXc5mJsHVYTZR1maL5l9w | Andrew Ng's org | 2026-11-04 | 9/15 | listicles | **Reject:** mostly course and event promotion; real courses are paywalled on Coursera |
| Stanford MLSys Seminars | @StanfordMLSysSeminars | UCzz6ructab1U44QPI3HpZEQ | Systems seminar | 2026-06-20 | 2/15 | own knowledge | **Reject:** 13/15 Shorts now |
| Cohere / Cohere Labs | (handle 404) | UCAKTUy0tz47ZY02DFpxMqoQ | Cohere For AI research talks | `[unverified]` | not checked | own knowledge | Company channel; not checked further |

### Course playlists (official uploader verified)

| Course | Playlist ID | Uploader (official) | Videos | Why |
|---|---|---|---|---|
| Neural Networks: Zero to Hero (Karpathy) | PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ | Andrej Karpathy | 10 | Canonical build-GPT-from-scratch course. Karpathy is TRUSTED, but the course is not in COURSES |
| Berkeley CS 285 Deep RL, 2023 | PL_iWQOsE6TfVYGEGiAOMaOzzv41Jfm_Ps | RAIL (Levine's lab) | 99 | Standard deep RL course; underpins RLHF and RL for reasoning |
| CMU Advanced NLP, Spring 2024 | PL8PYTP1V4I8DZprnWryM4nR8IZl1ZXDjg | Graham Neubig | 21 | Current LLM-era NLP course |
| CMU Inference Algorithms for Language Modeling, Fall 2025 | PL8PYTP1V4I8DY15Ob83nmwBAVyNtUQadX | Graham Neubig | 12 | Decoding, test-time compute, sampling: very current |
| MIT 6.5940 EfficientML, Fall 2023 | PL80kAHvQbh-pT4lCkDT53zT8DKmhE0idB | MIT HAN Lab | 46 | Quantization, pruning, distillation, LLM serving |
| MIT 6.5940 EfficientML, Fall 2026 (in progress) | PLH7PIPKvCm38 | MIT HAN Lab | 15 | Same course, 2026 run. The ID is an unusual short form but resolves in yt-dlp |
| CMU 11-785 Intro to Deep Learning, Fall 2026 lectures (in progress) | PLFdeaiXAitLI | Carnegie Mellon University Deep Learning | 20 | Full current DL course. The ID is a short form but resolves in yt-dlp |
| Cornell CS4780 ML for Intelligent Systems (Weinberger) | PLl8OlHZGYOQ7bkVbuRthEsaLr7bONzbXS | Kilian Weinberger | 41 | Widely loved classic ML-theory lectures |
| Caltech CS 156 Learning From Data (Abu-Mostafa) | PLD63A284B7615313A | caltech | 18 | Classic learning-theory course |
| DeepMind x UCL Intro to RL 2015 (David Silver) | PLqYmG7hTraZDM-OYHWgPebj2MfCFzFObQ | Google DeepMind | 10 | The canonical RL lectures |
| DeepMind x UCL Deep Learning 2020 | PLqYmG7hTraZCDxZ44o4p3N5Anz3lLRVZF | Google DeepMind | 12 | Research-scientist lectures |
| DeepMind x UCL Deep Learning 2021 | PLqYmG7hTraZDVH599EItlEWsUOsJbAodm | Google DeepMind | 13 | Same series, 2021 run |
| Berkeley Deep Unsupervised Learning, Spring 2020 | PLwRJQ4m4UJjPiJP3691u-qWwPGVKzSlNP | Pieter Abbeel | 12 | Generative models (VAE, flows, autoregressive). Dated but foundational |
| Stanford CS330 Multi-Task and Meta Learning | PLoROMvodv4rMC6zfYmnD7UG3LVvwaITY5 | Stanford Online | 14 | Maybe: not on the in-progress list, but the Stanford Online channel is being added anyway |

## 2. Math

| Name (feed title) | Handle | Channel ID | Why it signals depth | Latest | Long/15 | Source | Risk |
|---|---|---|---|---|---|---|---|
| The Bright Side of Mathematics | @brightsideofmaths | UCdwo4k1RQHTcq_-WS7Cazqg | Complete rigorous series (real analysis, measure theory, linear algebra, functional analysis) | 2026-11-04 | 15/15 | own knowledge | Some members-early content; free otherwise |
| Professor Leonard | @ProfessorLeonard | UCoHhuummRZaIVX7bD4t2czg | Full-length calculus, differential equations and statistics lectures | 2026-10-24 | 15/15 | [PhysicsForums](https://www.physicsforums.com/threads/who-are-the-top-math-physics-content-creators-on-youtube-and-beyond.990537/) | none |
| Another Roof | @AnotherRoof | UCHEnZhUKjZSLYs3jJ0raKZA | Long foundations explainers (constructing numbers, set theory) | 2026-10-22 | 15/15 | own knowledge | none |
| Mathemaniac | @mathemaniac | UCrlZs71h3mTR45FgQNINfrg | Visual series on complex analysis and group theory | 2026-09-06 | 15/15 | own knowledge | none |
| Morphocular | @morphocular | UCu7Zwf4X_OQ-TEnou0zdyRA | Deep visual explainers in the 3b1b style | 2026-02-08 | 13/15 | own knowledge | Slow cadence |
| Aleph 0 | @Aleph0 | UCzBjutX2PmitNF4avysL-vg | Algebra and algebraic geometry intuition at graduate level | 2025-11-29 | 14/15 | own knowledge | Slow cadence |
| Dr. Trefor Bazett | @DrTrefor | UC9rTsvTxJnx1DNrDA3Rqa6A | Professor; full courses plus cool-topic explainers | 2026-10-15 | 8/15 | r/math snippet, [LessWrong](https://www.lesswrong.com/posts/MZHgJwJD7jR4REFDP/a-layman-s-guide-to-recreational-mathematics-videos) | 7/15 Shorts; some sponsor reads |
| Sheafification of G | @SheafificationOfG | UC6_J0wZdqcoRVs0Mck922SQ | Graduate-level algebra and topology with humour | 2026-10-23 | 15/15 | own knowledge | Joke-heavy register |
| MathTheBeautiful | @MathTheBeautiful | UCr22xikWUK2yUW4YxOKXclQ | Grinfeld's tensor calculus and linear algebra lecture series | 2026-01-24 | 15/15 | own knowledge | none |
| sudgylacmoe | @sudgylacmoe | UCEo_JfTH_9FK-7k9-mAWJkQ | Geometric algebra course series | 2026-10-27 | 15/15 | own knowledge | Niche |
| Stand-up Maths | @standupmaths | UCSju5G2aFaWMqn-_0YBtq5A | Matt Parker; recreational but honest maths | 2026-10-30 | 15/15 | LessWrong | Entertainment-leaning |
| Richard E Borcherds | @richarde.borcherds7998 | UCIyDqfi_cbkp-RU20aBF-MQ | Fields medallist's graduate lecture courses | 2024-07-16 | 15/15 | own knowledge | Inactive for 2.3 years, but a finished classic |
| Fields Institute | @FieldsInstitute | UCSzx-qTK2639JBWgrb6mTmw | Research talks | 2026-11-03 | 15/15 | own knowledge | Very high volume; TRUSTED only |
| Institut des Hautes Etudes Scientifiques (IHES) | (no handle) | UC4R1IsRVKs_qlWKTm9pT82Q | Research lectures and summer schools | 2026-11-03 | 15/15 | own knowledge | Research-level; TRUSTED only |
| ICTP Mathematics | (no handle) | UC-akozxNLMPcMcs0qVvS1VQ | Graduate courses and schools | 2026-07-01 | 15/15 | own knowledge | Research-level |
| Oxford Mathematics | @OxfordMathematics | UCLnGGRG__uGSPLBLzyhg8dQ | Real Oxford undergraduate lectures and public lectures | 2026-11-04 | 6/15 | own knowledge | 9/15 Shorts; maybe |
| The Math Sorcerer | @TheMathSorcerer | UCr7lmzIk63PZnBw3bezl-Mg | Real analysis and proof lectures | 2026-11-04 | 13/15 | r/math snippet | Much of the output is book-collection and motivation videos |
| Michael Penn | @MichaelPennMath | UC6jM0RFkr4eSkzT5Gx0HOAw | Number theory problem solving | 2026-11-03 | 3/15 | own knowledge | **Reject:** 12/15 Shorts |
| Gresham College | @GreshamCollege | UC1t6kKXoBvjdr8m9KJ2Fx7A | Free public lectures across all topics | 2026-11-04 | 2/15 | own knowledge | **Reject as FOLLOW:** 13/15 Shorts. Could be TRUSTED later |
| Zach Star | @ZachStar | UCpCSAcbqs-sjEVfk_hMfY9w | Engineering maths | 2026-09-21 | 15/15 | own knowledge | **Reject:** drifted to comedy sketches |
| Catsters (category theory) | — | — | Category theory course | `[unverified]` | not checked | PhysicsForums | Not checked |

Math playlist: Borcherds, Algebraic topology, `PL8yHsr3EFj52yxQGxQoxwOtjIEtxE2BWx` (official uploader, only 4 videos). His larger course playlists weren't enumerated (`[unverified]`); following the channel is simpler.

## 3. Physics

| Name (feed title) | Handle | Channel ID | Why it signals depth | Latest | Long/15 | Source | Risk |
|---|---|---|---|---|---|---|---|
| Richard Behiel | @RichBehiel | UCogE_pJuDs_xLtDVcp4W_UA | Hour-long derivations (QED, the Schrödinger field, electromagnetism) | 2026-10-08 | 15/15 | own knowledge | none |
| Lectures by Walter Lewin. They will make you ♥ Physics. | @lecturesbywalterlewin.they9259 | UCiEHVhv0SBMpP75JbzJShqw | MIT 8.01/8.02/8.03 lectures and problem walkthroughs | 2026-11-01 | 15/15 | own knowledge | Lewin was stripped of MIT emeritus status in 2014 (harassment finding). Content quality is not disputed, but it is a reputational risk. Owner's call |
| Tobias Osborne | (no handle) | UCpHjg_Qmzxm3xaAWRrwQPCA | Full graduate quantum information and many-body lecture courses (Hannover) | 2026-07-22 | 15/15 | own knowledge | Podcast episodes mixed in |
| ScienceClic English | @ScienceClicEN | UCWvq4kcdNI1r1jZKFw9TiUA | Accurate visualised relativity and quantum explainers | 2026-09-19 | 15/15 | own knowledge | none |
| Up and Atom | @upandatom | UCSIvk78tK2TiviLQn4fSHaw | Physics, maths and CS explainers with real depth | 2026-10-14 | 15/15 | own knowledge | Sponsor reads |
| Huygens Optics | @HuygensOptics | UC26YLK0OEbLB3TCYxGh8xVQ | Experimental optics done properly | 2026-10-05 | 9/15 | own knowledge | 6/15 Shorts |
| The WE-Heraeus International Winter School on Gravity and Light | (no handle) | UCUHKG3S9N_QeIE2jQXd2-VQ | Schuller's complete general relativity course | 2015-05-11 | 15/15 | own knowledge | Finished classic, so the inactive cutoff doesn't apply |
| Andrew Dotson | @AndrewDotsonvideos | UCnFmWQbVW_YbqPQZGNuq8sA | Graduate physics problem sets and topics | 2025-05-21 | 14/15 | own knowledge | Some personal and vlog content; slowing |
| Physics Explained | @PhysicsExplainedVideos | UCIZ5ZOeiXYbmKTl_85ghNPw | Derivation-led long-form | 2026-11-02 | 6/15 | own knowledge | 9/15 Shorts; maybe |
| Perimeter Institute for Theoretical Physics | @PIOutreach | UCpHvNclapYpq8b0ZnGRoMeg | Public lectures by working physicists | 2026-10-28 | 5/15 | own knowledge | 10/15 Shorts; maybe |
| Arvin Ash | @ArvinAsh | UCpMcsdZf2KkAnfmxiq2MfMQ | Pop explainers of modern physics | 2026-10-31 | 9/15 | own knowledge | Pop register; some clickbait titles |
| Quanta Magazine | @QuantaScienceChannel | UCTpmmkp1E4nmZqWPS-dl5bg | Research-journalism explainers | 2026-10-30 | 9/15 | own knowledge | Journalism ("breakthrough" framing); maybe |
| Yale Courses | @YaleCourses | UC4EY_qnSeAP1xGsh61eOoJA | Open Yale lectures (history, physics, astrophysics) | 2026-10-28 | 15/15 | own knowledge | New uploads mix in non-academic videos and politics series; use the playlists |
| Steve Mould | @SteveMould | UCEIwxahdLz7bap-VDs9h35A | Physics demonstrations | 2026-10-31 | 7/15 | own knowledge | Maybe; entertainment-leaning |
| Physics with Elliot | @PhysicswithElliot | UCP3alkHEJhoxTpy3iVON-lg | Lagrangian/Hamiltonian mechanics | 2026-10-15 | 2/15 | own knowledge | **Reject:** 13/15 Shorts |
| Physics Videos by Eugene Khutoryansky | @EugeneKhutoryansky | UCJ0yBou72Lz9fqeMXh9mkog | Animated physics | 2026-10-25 | 2/15 | own knowledge | **Reject:** 13/15 Shorts |
| AlphaPhoenix | @AlphaPhoenixChannel | UCCWeRTgd79JL0ilH0ZywSJA | Experiments | 2026-10-06 | 6/15 | own knowledge | **Reject:** mostly Shorts |
| The Royal Institution | @TheRoyalInstitution | UCYeF244yNGuFefuFKqxIAXw | Public science lectures | 2026-11-04 | 5/15 | own knowledge | **Reject as FOLLOW:** 10/15 Shorts |
| ICTP (physics main channel) | handle `@ictp` resolves to an unrelated channel | — | Physics schools | `[unverified]` | not checked | own knowledge | `@ictp` and `@ICTP` point to an unrelated Arabic-language channel |

### Physics course playlists (official uploader verified)

| Course | Playlist ID | Uploader | Videos |
|---|---|---|---|
| Schuller, Lectures on Geometrical Anatomy of Theoretical Physics | PLPH7f_7ZlzxTi6kS4vCmv4ZKm9u8g5yic | Frederic Schuller | 28 |
| Osborne, Mathematical methods of quantum information theory | PLDfPUNusx1EoBAn8vXYjcF95R7mI_eR6o | Tobias Osborne | 18 |
| Yale ASTR 160 Frontiers/Controversies in Astrophysics (Bailyn) | PLD1515420F4E601A4 | YaleCourses | 29 |

Yale PHYS 200 (Shankar): every playlist I found is a re-upload (galaxy387, Willtech Online, Lily Cheang, Sjurnberry). The 57 playlists `yt-dlp` listed for YaleCourses don't include it. Official playlist `[unverified]`.

## 4. Computer Science

| Name (feed title) | Handle | Channel ID | Why it signals depth | Latest | Long/15 | Source | Risk |
|---|---|---|---|---|---|---|---|
| CMU Database Group | @CMUDatabaseGroup | UCHnBsf2rH-K7pn09rb3qvkA | Andy Pavlo's full 15-445/15-721 courses plus seminar series | 2026-11-03 | 15/15 | own knowledge | none |
| Computerphile | @Computerphile | UC9-y-6csu5WGm29I7JiwpnA | Academics explain CS topics (Nottingham) | 2026-10-30 | 15/15 | own knowledge | Pop-level at times |
| Ben Eater | @BenEater | UCS0N5baNlQWJCUrhCEo8WlA | Builds computers from logic gates up | 2026-10-18 | 15/15 | own knowledge | Kit sales, low key |
| Core Dumped | @CoreDumpped | UCGKEMK3s-ZPbjVOIuAV8clQ | Operating-system internals, animated and accurate | 2026-10-30 | 15/15 | own knowledge | Sponsor reads |
| Sebastian Lague | @SebastianLague | UCmtyQOKKmrMVaKuRXz02jbQ | Long coding adventures (ray tracing, fluid simulation, chips) | 2026-10-01 | 15/15 | own knowledge | none |
| Jon Gjengset | @jonhoo | UC_iD0xppBwwsrM9DegC5cQQ | Multi-hour Rust internals and implementation streams | 2026-07-19 | 14/15 | own knowledge | Very long streams |
| Missing Semester | @MissingSemester | UCuXy5tCgEninup9cGplbiFw | MIT tools course (shell, git, debugging) | 2026-02-19 | 15/15 | own knowledge | none |
| PapersWeLove | @PapersWeLove | UCoj4eQh_dZR37lL78ymC6XA | Talks on classic CS papers | 2026-08-27 | 15/15 | own knowledge | Uneven audio |
| Strange Loop Conference | @StrangeLoopConf | UC_QIfHvN9auy2CoOdSfMWDw | Top-tier PL and systems talks | 2023-10-13 | 15/15 | own knowledge | Conference ended in 2023; finished archive |
| Spanning Tree | @SpanningTree | UCDzVUXiTr3hClI-zzCWbYzg | Algorithms explainers | 2025-02-10 | 15/15 | own knowledge | Slow |
| Abdul Bari | @abdul_bari | UCZCFT11CWBi3MHNlGf019nw | Classic algorithms lectures | 2025-04-08 | 15/15 | own knowledge | Udemy upsell |
| Tsoding Daily | @TsodingDaily | UCrqM0Ym_NbK1fqeQG2VIohg | Builds things from scratch on stream (C, compilers) | 2026-10-31 | 15/15 | own knowledge | Maybe: streams are long and meandering, joke titles |
| Molly Rocket | @MollyRocket | UCaTznQhurW5AaiYPbhEA-KA | Casey Muratori on performance and computer history | 2026-10-27 | 15/15 | own knowledge | Maybe: some opinion and rant content |
| Reducible | @Reducible | UCK8XIGR5kRidIw2fWqwyHRA | Excellent algorithms explainers | 2024-07-27 | 15/15 | own knowledge | Inactive for 2.3 years; finished; maybe |
| Andreas Kling | @awesomekling | UC3ts8coMP645hZw9JSD3pqQ | Browser and OS development (Ladybird) | 2024-11-19 | 15/15 | own knowledge | Maybe: inactive for 2 years |
| MIT 6.824: Distributed Systems | (no handle) | UC_7WrbZTCODu1o_kfUMq88g | Robert Morris's distributed systems course, 2020 | 2020-05-08 | 15/15 | own knowledge | Finished course; use the playlist |
| WilliamFiset | @WilliamFiset-videos | UCD8yeTczadqdARzQUp29PJw | Graph algorithms series | 2023-06-20 | 15/15 | own knowledge | **Reject as FOLLOW:** inactive for 3.4 years |

### CS course playlists (official uploader verified)

| Course | Playlist ID | Uploader | Videos |
|---|---|---|---|
| MIT 6.824 Distributed Systems (Spring 2020) | PLrw6a1wE39_tb2fErI4-WkMbsvGQk9_UB | MIT 6.824: Distributed Systems | 20 |
| CMU 15-445/645 Intro to Database Systems, Fall 2025 | PLSE8ODhjZXjYMAgsGH-GtY5rJYZ6zjsd5 | CMU Database Group | 25 |
| CMU 15-445/645 Intro to Database Systems, Fall 2024 | PLSE8ODhjZXjYDBpQnSymaectKjxCy6BYq | CMU Database Group | 26 |
| CMU 15-721 Advanced Database Systems, Spring 2024 | PLSE8ODhjZXjYa_zX-KeMJui7pcN1rIaIJ | CMU Database Group | 22 |

## 5. History

| Name (feed title) | Handle | Channel ID | Why it signals depth | Latest | Long/15 | Source | Risk |
|---|---|---|---|---|---|---|---|
| ReligionForBreakfast | @ReligionForBreakfast | UCct9aR7HC79Cv2g-9oDOTLw | PhD religious-studies scholar; ancient religion and history with citations | 2026-10-29 | 12/15 | own knowledge | Sponsor reads |
| ESOTERICA | @TheEsotericaChannel | UCoydhtfFSk1fZXNRnkGnneQ | Academic history of esotericism and intellectual history (PhD host) | 2026-10-30 | 11/15 | own knowledge | Niche |
| Ancient Americas | @AncientAmericas | UCEqNbbsx0i7fhwRt0saYIcQ | Archaeology-grounded pre-Columbian history | 2026-11-01 | 12/15 | own knowledge | none |
| Premodernist | (no handle) | UC2xHMABk_sX2aC14-D7OhIw | Long medieval and early-modern deep dives | 2026-07-04 | 15/15 | own knowledge | none |
| Voices of the Past | @VoicesofthePast | UCqoGR_EedlhKDVuWNwYWRbg | Primary-source readings (ancient and medieval texts) | 2025-07-30 | 15/15 | own knowledge | Slow |
| Invicta | @InvictaHistory | UCwO-UgquohXwoe7f0e6lMnw | Documentary-style ancient and military history, well sourced | 2026-10-15 | 15/15 | own knowledge | Military focus; the war NOISE filter doesn't apply to FOLLOW entries |
| History Time | @HistoryTime | UCN9v4QG3AQEP3zuRvVs2dAg | Long British and European history documentaries | 2026-11-03 | 15/15 | own knowledge | Narrated-documentary register |
| History Matters | @HistoryMatters | UC22BdTgxefuvUivrjesETjg | Short animated "why" questions | 2026-10-16 | 15/15 | own knowledge | Maybe: short and shallow |
| Kings and Generals | @KingsandGenerals | UCMmaBzfCCwZ2KqaBJjkj0fw | Campaign histories | 2026-11-04 | 7/15 | own knowledge | **Reject:** war-centric, 8/15 Shorts |
| Epic History | @EpicHistoryTV | UCvPXiKxH-eH9xq-80vpgmKQ | Military history | 2026-11-02 | 2/15 | own knowledge | **Reject:** 13/15 Shorts |
| Tasting History with Max Miller | @TastingHistory | UCsaGKqPZnGp_7N80hcHySGQ | Food history | 2026-11-03 | 5/15 | own knowledge | **Reject:** entertainment, 10/15 Shorts |
| World History Encyclopedia | @WorldHistoryEncyclopedia | UCXjB5CYw3yCS8soFozLhPFQ | Encyclopedia videos | 2026-11-01 | 3/15 | own knowledge | **Reject:** 12/15 Shorts |
| JABZ, Drew Durnil | @Jabzy, @DrewDurnil | — | Map and history videos | 2026-11 | 6/15, 7/15 | own knowledge | **Reject:** mostly Shorts, pop register |

### History course playlists (Open Yale, official uploader YaleCourses)

| Course | Playlist ID | Videos |
|---|---|---|
| The Early Middle Ages, 284-1000 (Freedman) | PL77A337915A76F660 | 22 |
| Introduction to Ancient Greek History (Kagan) | PL023BCE5134243987 | 24 |
| European Civilization 1648-1945 (Merriman) | PL3A8E6CE294860A24 | 24 |
| Early Modern England (Wrightson) | PL18B9F132DFD967A3 | 25 |
| The American Revolution (Freeman) | PLDA2BC5E785D495AB | 25 |
| The Civil War and Reconstruction (Blight) | PL5DD220D6A1282057 | 27 |

Two more YaleCourses playlists are left out because they cut against the feed's no-politics and no-war rules: "Timothy Snyder: The Making of Modern Ukraine" (`PLh9mgdi4rNewfxO7LhBoz_1Mx1MaO6sw_`) and "Power and Politics in Today's World". The Snyder series is solid scholarship; including it is the owner's call.

## 6. Japanese

| Name (feed title) | Handle | Channel ID | Why it signals depth | Latest | Long/15 | Source | Risk |
|---|---|---|---|---|---|---|---|
| にほんごのじかん \| Japanese Comprehensible Input (CI) | (no handle) | UCdZHET-9_Comx6UaVTSETiQ | All-Japanese comprehensible-input lessons, graded | 2026-11-04 | 15/15 | [Bunpro thread](https://community.bunpro.jp/t/comprehensible-input/202553), own knowledge | `[unverified]` whether this is Yuki's new channel (one community snippet says so) |
| ToKini Andy | @ToKiniAndy | UCsHzgQRjPzOz_w4HSrNLIVw | Deep grammar and nuance analysis | 2026-11-03 | 15/15 | own knowledge | Some members-only content |
| Kaname Naito | @kanamenaito | UC2_krAagEXVPftDXZCDiVZA | Native teacher on natural nuance | 2026-11-01 | 12/15 | Reddit list (via search) | none |
| Miku Real Japanese | @MikuRealJapanese | UCsQCbl3a9FtYvA55BxdzYiQ | Natural-speed Japanese with explanations | 2026-10-28 | 11/15 | search summary | Course upsell |
| Japanese with Shun | @JapanesewithShun | UCu6sZrHyl4hSS2PvlUo2XZA | Slow daily-life vlogs with Japanese subtitles | 2026-11-04 | 12/15 | [Migaku](https://migaku.com/blog/japanese/best-japanese-youtube-channels) | none |
| Speak Japanese Naturally | (no handle) | UCSbH_BPR_AoARW6RDYLlLog | Casual-speech patterns | 2026-11-01 | 10/15 | Migaku | none |
| Masa - Comprehensible Input Japanese | (no handle) | UCpqNTQxGWArbe4EI_5kJ4Rg | Comprehensible-input stories | 2026-11-03 | 12/15 | own knowledge (search) | Less established |
| 日本語の森 (Nihongo no Mori) | @nihongonomori2013 | UCVx6RFaEAg46xfAsD2zz16w | JLPT N5-N1 grammar playlists | 2026-11-04 | 7/15 | Migaku | 8/15 Shorts; maybe |
| 三本塾 -Sambon Juku- | @SambonJuku | UC0ujXryUUwILURRKt9Eh7Nw | Grammar by level | 2024-12-29 | 15/15 | Migaku | Slowing |
| Organic Japanese with Cure Dolly | (no handle) | UCkdmU8hGK4Fg3LghTVtKltQ | Structural Japanese grammar, a cult classic | 2021-05-15 | 15/15 | search summary, own knowledge | Finished (the creator died in 2021); synthetic voice; use playlists |
| Comprehensible Japanese (CIJ) | @cijapanese (404) | — | Most-cited Japanese comprehensible-input channel | `[unverified]` | not checked | Migaku | Handle 404s and search didn't find it; it may have moved off YouTube |

Japanese playlists (official uploader "Organic Japanese with Cure Dolly"):

| Playlist | ID | Videos |
|---|---|---|
| Japanese Grammar Structure - What the textbooks don't teach | PLg9uYxuZf8x9KjPQykE6c_fv4DXg8pfX0 | 16 |
| Japanese Immersion: The organic approach | PLg9uYxuZf8x_iLm90ie4ewro0lFedXncO | 30 |

The "Japanese From Scratch" playlist wasn't among the official playlists (`[unverified]`). The two big all-videos playlists found are third-party (IM Gelfand; "That one dude who posted stuff"), so they're rejected.

## 7. Mandarin

| Name (feed title) | Handle | Channel ID | Why it signals depth | Latest | Long/15 | Source | Risk |
|---|---|---|---|---|---|---|---|
| Lazy Chinese - Comprehensible Input | (no handle) | UCjSFDgRCzh_1ZPhxChVgK7Q | Slow all-Chinese comprehensible input, repetition, visuals | 2026-11-03 | 15/15 | [Discover Discomfort](https://discoverdiscomfort.com/?p=18549) | none |
| Story learning Chinese with Annie | (no handle) | UCa2MkPgQHW7hZC9E8xBk6fQ | 20-30 minute calm story and listening sessions | 2026-10-23 | 15/15 | Discover Discomfort | none |
| Yimin Chinese艺敏中文 | @YiminChinese | UCTwUbtaSPl13qpT6sKB3dwA | Grammar and natural-speech lessons | 2026-11-04 | 15/15 | own knowledge | Course upsell |
| Mandarin Click | @MandarinClick | UCcvTOgUiplI80SPR73ogCEQ | Graded stories by HSK level | 2024-05-25 | 15/15 | Discover Discomfort | Inactive for 2.4 years, but it's a finished graded library; maybe |
| Chloe Chinese Class | (no handle) | UCxOhdldi9RED-8zi6EWxp_w | Learner podcasts | 2026-11-02 | 6/15 | Discover Discomfort | 9/15 Shorts; some membership-gated; maybe |
| Xiaogua Chinese | @XiaoguaChinese | UCc-YIMz_tv1K_FKE4noY_Cw | Big graded library | 2026-11-04 | 2/15 | Discover Discomfort | **Reject:** 13/15 Shorts in the recent feed |
| Chinese Zero to Hero | @chinesezerotohero | UCQ3IlLg5VGeydxtswBoyt6A | HSK courses | 2026-10-08 | 2/15 | own knowledge | **Reject:** 13/15 Shorts |
| Chinese For Us | @ChineseForUs | UCP2rJ9xSATDSqufo30mZC_w | HSK lessons | 2024-03-23 | 15/15 | own knowledge | **Reject:** inactive for 2.6 years, course upsell |
| BlaBla Chinese, Chinese Podcast With Shenglan | — | — | Comprehensible-input and podcasts | `[unverified]` | not checked | Discover Discomfort | Not checked |

## 8. Korean

| Name (feed title) | Handle | Channel ID | Why it signals depth | Latest | Long/15 | Source | Risk |
|---|---|---|---|---|---|---|---|
| Easy Korean! | (no handle) | UCHxNPAnqTB4ohG5xl6MyuXg | Street interviews with dual subtitles | 2026-10-31 | 15/15 | own knowledge | none |
| 최수수 ChoiSusu | @choisusu | UCb9kdZ3LKOTTcpp_1pw0o3g | Slow natural Korean conversation and vlogs | 2026-11-01 | 15/15 | own knowledge | none |
| Daily Korean with Jaerim | (no handle) | UCxgtz63eg45670eqiEW9r4g | Comprehensible-input daily-life Korean | 2026-10-22 | 15/15 | own knowledge (search) | Less established |
| Dive Korean - Comprehensible Input | (no handle) | UCmDctpxqbyedTLwi96_dyAA | Graded comprehensible input | 2026-10-28 | 15/15 | own knowledge (search) | Less established |
| 태웅쌤 - Comprehensible Input Korean | (no handle) | UC737T1zTN6MQ1uWorHVAXvA | Teacher-led comprehensible input | 2026-10-23 | 15/15 | own knowledge (search) | Less established |
| Korean Jun | @KoreanJun | UCtUtTem8ulPuLLtjt80bB-A | — | none | 0/0 | own knowledge | **Reject:** empty feed |
| sarangkorean | @SarangKorean | UCYJtLVXrHYak0CSZ7jwSWrA | — | 2009-06-12 | 14/14 | own knowledge | **Reject:** wrong or defunct channel |
| Pronounce Korean, Korean to the Point, Speak Korean with Jiyoung | — | — | Mentioned in search summaries | `[unverified]` | not checked | search summary | Handles 404'd |

## Things I could not verify

- Comprehensible Japanese (CIJ): channel not found.
- Whether にほんごのじかん is Yuki's channel.
- The official Yale PHYS 200 Shankar playlist (only re-uploads found).
- Cure Dolly's "Japanese From Scratch" playlist.
- The ICTP physics main channel.
- Catsters.
- Cohere Labs.
- BlaBla Chinese, Shenglan, Pronounce Korean, Korean to the Point.
- Borcherds's larger course playlists (not enumerated).
- Short-form playlist IDs `PLH7PIPKvCm38` and `PLFdeaiXAitLI`: they resolve in yt-dlp today, but I did not check that they survive in the browser or after the course ends.
