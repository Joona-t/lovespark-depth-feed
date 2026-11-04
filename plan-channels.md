# Depth Feed: channel and course additions (plan)

Evidence for every row (channel IDs, feed checks, sources) is in `research-channels.md`. All IDs below were verified live on 2026-11-04.

**Verdict:** recommended adds are 33 channels for FOLLOW, 8 institutional channels for TRUSTED and 29 course playlists for COURSES. There are 17 "maybe"s, and 30 candidates are rejected with a reason.

## One design decision first (owner's call)

Today every non-language FOLLOW entry shows under the **Following** chip and skips the drama filter (`scripts/build.mjs:117-118`, `:200-201`). Adding 30-odd depth channels there would swamp the Following chip, which currently holds his 4 personal picks.

The History entries already avoid this with `lang: true, label: "History channel"`. That keeps them out of Following, files them under their topic chip, and marks them `learn`. The entries below use that same pattern with per-topic labels ("AI channel", "Math channel", and so on).

If he'd rather they show under Following, delete `lang: true` and `label` from each entry. Note that `lang: true` also means titles are not topic-matched: the `tags` given are used as-is (`build.mjs:199`).

TRUSTED keys must equal the oEmbed `author_name`. I used the feed `<title>`, which matches it, but `[unverified]` for the two titles containing `&` (the feed shows `&amp;`; the decoded name is used below).

## Top 10 picks

1. **Karpathy, Neural Networks: Zero to Hero** (COURSE). The canonical build-an-LLM course. Karpathy is TRUSTED, but his course isn't in COURSES.
2. **GPU MODE** (FOLLOW). 15/15 long-form kernel and LLM-systems lectures: the current-techniques frontier.
3. **CMU Inference Algorithms for Language Modeling, Fall 2025** (Neubig, COURSE). Test-time compute and decoding, very current.
4. **Neel Nanda** (FOLLOW). Mechanistic interpretability from a lead researcher.
5. **Berkeley CS 285 Deep RL 2023** (COURSE). The RL foundation under RLHF and reasoning models.
6. **CMU Advanced NLP, Spring 2024** (Neubig, COURSE).
7. **The Bright Side of Mathematics** (FOLLOW). Complete rigorous university series, active daily.
8. **Richard Behiel** (FOLLOW). Hour-long physics derivations.
9. **CMU 15-445 Intro to Database Systems, Fall 2025** (COURSE) plus the CMU Database Group channel.
10. **Lazy Chinese - Comprehensible Input** (FOLLOW). The most-recommended Mandarin comprehensible-input channel, 15/15 long-form.

Honourable mentions: Jia-Bin Huang, MIT 6.5940 EfficientML, Yale *Early Middle Ages* (Freedman), Schuller's *Geometrical Anatomy*, にほんごのじかん, ChoiSusu.

## Recommended: paste-ready entries

### COURSES (append to the array)

```js
  // AI / LLMs
  { id: "PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ", name: "Andrej Karpathy", course: "Karpathy: Neural Networks Zero to Hero", tags: ["AI", "LLMs"] },
  { id: "PL8PYTP1V4I8DY15Ob83nmwBAVyNtUQadX", name: "Graham Neubig", course: "CMU Inference Algorithms for LMs (F25)", tags: ["LLMs", "AI"] },
  { id: "PL8PYTP1V4I8DZprnWryM4nR8IZl1ZXDjg", name: "Graham Neubig", course: "CMU 11-711 Advanced NLP (S24)", tags: ["LLMs", "AI"] },
  { id: "PL_iWQOsE6TfVYGEGiAOMaOzzv41Jfm_Ps", name: "RAIL", course: "Berkeley CS 285 Deep RL (2023)", tags: ["AI"] },
  { id: "PL80kAHvQbh-pT4lCkDT53zT8DKmhE0idB", name: "MIT HAN Lab", course: "MIT 6.5940 EfficientML (F23)", tags: ["AI", "LLMs"] },
  { id: "PLFdeaiXAitLI", name: "Carnegie Mellon University Deep Learning", course: "CMU 11-785 Intro to Deep Learning (F26)", tags: ["AI"] },
  { id: "PLl8OlHZGYOQ7bkVbuRthEsaLr7bONzbXS", name: "Kilian Weinberger", course: "Cornell CS4780 Machine Learning", tags: ["AI", "Math"] },
  { id: "PLD63A284B7615313A", name: "caltech", course: "Caltech CS 156 Learning From Data", tags: ["AI", "Math"] },
  { id: "PLqYmG7hTraZDM-OYHWgPebj2MfCFzFObQ", name: "Google DeepMind", course: "DeepMind x UCL Intro to RL (Silver)", tags: ["AI"] },
  { id: "PLqYmG7hTraZDVH599EItlEWsUOsJbAodm", name: "Google DeepMind", course: "DeepMind x UCL Deep Learning 2021", tags: ["AI"] },
  { id: "PLwRJQ4m4UJjPiJP3691u-qWwPGVKzSlNP", name: "Pieter Abbeel", course: "Berkeley CS294-158 Deep Unsupervised Learning", tags: ["AI"] },
  // Math / Physics
  { id: "PLPH7f_7ZlzxTi6kS4vCmv4ZKm9u8g5yic", name: "Frederic Schuller", course: "Schuller: Geometrical Anatomy of Theoretical Physics", tags: ["Math", "Physics"] },
  { id: "PLDfPUNusx1EoBAn8vXYjcF95R7mI_eR6o", name: "Tobias Osborne", course: "Osborne: Math Methods of Quantum Information", tags: ["Physics", "Math"] },
  { id: "PLD1515420F4E601A4", name: "YaleCourses", course: "Yale ASTR 160 Frontiers of Astrophysics", tags: ["Physics"] },
  // Computer Science
  { id: "PLSE8ODhjZXjYMAgsGH-GtY5rJYZ6zjsd5", name: "CMU Database Group", course: "CMU 15-445 Database Systems (F25)", tags: ["Computer Science"] },
  { id: "PLSE8ODhjZXjYa_zX-KeMJui7pcN1rIaIJ", name: "CMU Database Group", course: "CMU 15-721 Advanced Database Systems (S24)", tags: ["Computer Science"] },
  { id: "PLrw6a1wE39_tb2fErI4-WkMbsvGQk9_UB", name: "MIT 6.824: Distributed Systems", course: "MIT 6.824 Distributed Systems (S20)", tags: ["Computer Science"] },
  // History (Open Yale)
  { id: "PL77A337915A76F660", name: "YaleCourses", course: "Yale HIST 210 Early Middle Ages", tags: ["History"] },
  { id: "PL023BCE5134243987", name: "YaleCourses", course: "Yale CLCV 205 Ancient Greek History", tags: ["History"] },
  { id: "PL3A8E6CE294860A24", name: "YaleCourses", course: "Yale HIST 202 European Civilization 1648-1945", tags: ["History"] },
  { id: "PL18B9F132DFD967A3", name: "YaleCourses", course: "Yale HIST 251 Early Modern England", tags: ["History"] },
  { id: "PLDA2BC5E785D495AB", name: "YaleCourses", course: "Yale HIST 116 The American Revolution", tags: ["History"] },
  { id: "PL5DD220D6A1282057", name: "YaleCourses", course: "Yale HIST 119 Civil War and Reconstruction", tags: ["History"] },
  // Japanese
  { id: "PLg9uYxuZf8x9KjPQykE6c_fv4DXg8pfX0", name: "Organic Japanese with Cure Dolly", course: "Cure Dolly: Japanese Grammar Structure", tags: ["Japanese"] },
  { id: "PLg9uYxuZf8x_iLm90ie4ewro0lFedXncO", name: "Organic Japanese with Cure Dolly", course: "Cure Dolly: Japanese Immersion", tags: ["Japanese"] },
```

The CMU 11-785 Fall 2026 ID (`PLFdeaiXAitLI`) is a short-form ID that yt-dlp resolves today. Expect it to grow during the semester. If it ever fails, the build logs "skipped" (`build.mjs:213`), so it fails safe.

The Yale course numbers in the `course` labels are from memory, `[unverified]`. The playlist titles themselves were verified.

Language COURSES rows: the COURSES loop doesn't set `lang`, so these cards will show under the Japanese chip but not carry the language-card styling. `[unverified]` how the template treats this; check before adding.

### FOLLOW (append; History-style pattern)

```js
  // AI / LLMs: latest uploads under their topic chips (not Following).
  { id: "UCJgIbYl6C5no72a0NUAPcTA", name: "GPU MODE", tags: ["AI", "LLMs"], lang: true, label: "AI channel" },
  { id: "UCBMJ0D-omcRay8dh4QT0doQ", name: "Neel Nanda", tags: ["AI", "LLMs"], lang: true, label: "AI channel" },
  { id: "UCkQS_dP6GJTmYnMlox-YiKQ", name: "Jia-Bin Huang", tags: ["AI"], lang: true, label: "AI channel" },
  { id: "UC2JCYhib8HojEIBWFmH5g7A", name: "Graham Neubig", tags: ["LLMs", "AI"], lang: true, label: "AI channel" },
  { id: "UCcA-9WYwGaUrWiZaEDo84ng", name: "MIT HAN Lab", tags: ["AI", "LLMs"], lang: true, label: "AI channel" },
  { id: "UCYUq87t77YNTG5m256fOXeQ", name: "Gabriel Mongaras", tags: ["AI", "LLMs"], lang: true, label: "AI channel" },
  { id: "UCobqgqE4i5Kf7wrxRxhToQA", name: "AI Coffee Break with Letitia", tags: ["AI", "LLMs"], lang: true, label: "AI channel" },
  { id: "UCCcrR0XBH0aWbdffktUBEdw", name: "Mutual Information", tags: ["AI", "Math"], lang: true, label: "AI channel" },
  { id: "UC3sH8ShnMyB5MxavG1DaklA", name: "Algorithmic Simplicity", tags: ["AI"], lang: true, label: "AI channel" },
  { id: "UCgBncpylJ1kiVaPyP-PZauQ", name: "Luis Serrano Academy", tags: ["AI", "LLMs"], lang: true, label: "AI channel" },
  // Math
  { id: "UCdwo4k1RQHTcq_-WS7Cazqg", name: "The Bright Side of Mathematics", tags: ["Math"], lang: true, label: "Math channel" },
  { id: "UCoHhuummRZaIVX7bD4t2czg", name: "Professor Leonard", tags: ["Math"], lang: true, label: "Math channel" },
  { id: "UCHEnZhUKjZSLYs3jJ0raKZA", name: "Another Roof", tags: ["Math"], lang: true, label: "Math channel" },
  { id: "UCrlZs71h3mTR45FgQNINfrg", name: "Mathemaniac", tags: ["Math"], lang: true, label: "Math channel" },
  { id: "UCu7Zwf4X_OQ-TEnou0zdyRA", name: "Morphocular", tags: ["Math"], lang: true, label: "Math channel" },
  { id: "UCzBjutX2PmitNF4avysL-vg", name: "Aleph 0", tags: ["Math"], lang: true, label: "Math channel" },
  { id: "UC9rTsvTxJnx1DNrDA3Rqa6A", name: "Dr. Trefor Bazett", tags: ["Math"], lang: true, label: "Math channel" },
  { id: "UCr22xikWUK2yUW4YxOKXclQ", name: "MathTheBeautiful", tags: ["Math"], lang: true, label: "Math channel" },
  { id: "UCIyDqfi_cbkp-RU20aBF-MQ", name: "Richard E Borcherds", tags: ["Math"], lang: true, label: "Math channel" },
  // Physics
  { id: "UCogE_pJuDs_xLtDVcp4W_UA", name: "Richard Behiel", tags: ["Physics"], lang: true, label: "Physics channel" },
  { id: "UCpHjg_Qmzxm3xaAWRrwQPCA", name: "Tobias Osborne", tags: ["Physics"], lang: true, label: "Physics channel" },
  { id: "UCWvq4kcdNI1r1jZKFw9TiUA", name: "ScienceClic English", tags: ["Physics"], lang: true, label: "Physics channel" },
  { id: "UCSIvk78tK2TiviLQn4fSHaw", name: "Up and Atom", tags: ["Physics", "Math"], lang: true, label: "Physics channel" },
  { id: "UC26YLK0OEbLB3TCYxGh8xVQ", name: "Huygens Optics", tags: ["Physics"], lang: true, label: "Physics channel" },
  { id: "UCUHKG3S9N_QeIE2jQXd2-VQ", name: "Gravity and Light (Schuller)", tags: ["Physics", "Math"], lang: true, label: "Physics channel" },
  // Computer Science
  { id: "UCHnBsf2rH-K7pn09rb3qvkA", name: "CMU Database Group", tags: ["Computer Science"], lang: true, label: "CS channel" },
  { id: "UC9-y-6csu5WGm29I7JiwpnA", name: "Computerphile", tags: ["Computer Science"], lang: true, label: "CS channel" },
  { id: "UCS0N5baNlQWJCUrhCEo8WlA", name: "Ben Eater", tags: ["Computer Science"], lang: true, label: "CS channel" },
  { id: "UCGKEMK3s-ZPbjVOIuAV8clQ", name: "Core Dumped", tags: ["Computer Science"], lang: true, label: "CS channel" },
  { id: "UCmtyQOKKmrMVaKuRXz02jbQ", name: "Sebastian Lague", tags: ["Computer Science"], lang: true, label: "CS channel" },
  { id: "UC_iD0xppBwwsrM9DegC5cQQ", name: "Jon Gjengset", tags: ["Computer Science"], lang: true, label: "CS channel" },
  { id: "UCuXy5tCgEninup9cGplbiFw", name: "Missing Semester", tags: ["Computer Science"], lang: true, label: "CS channel" },
  { id: "UCoj4eQh_dZR37lL78ymC6XA", name: "PapersWeLove", tags: ["Computer Science"], lang: true, label: "CS channel" },
  { id: "UC_QIfHvN9auy2CoOdSfMWDw", name: "Strange Loop Conference", tags: ["Computer Science"], lang: true, label: "CS channel" },
  // History
  { id: "UCct9aR7HC79Cv2g-9oDOTLw", name: "ReligionForBreakfast", tags: ["History"], lang: true, label: "History channel" },
  { id: "UCoydhtfFSk1fZXNRnkGnneQ", name: "ESOTERICA", tags: ["History"], lang: true, label: "History channel" },
  { id: "UCEqNbbsx0i7fhwRt0saYIcQ", name: "Ancient Americas", tags: ["History"], lang: true, label: "History channel" },
  { id: "UC2xHMABk_sX2aC14-D7OhIw", name: "Premodernist", tags: ["History"], lang: true, label: "History channel" },
  { id: "UCqoGR_EedlhKDVuWNwYWRbg", name: "Voices of the Past", tags: ["History"], lang: true, label: "History channel" },
  { id: "UCN9v4QG3AQEP3zuRvVs2dAg", name: "History Time", tags: ["History"], lang: true, label: "History channel" },
  // Language learning
  { id: "UCdZHET-9_Comx6UaVTSETiQ", name: "にほんごのじかん", tags: ["Japanese"], lang: true },
  { id: "UCsHzgQRjPzOz_w4HSrNLIVw", name: "ToKini Andy", tags: ["Japanese"], lang: true },
  { id: "UC2_krAagEXVPftDXZCDiVZA", name: "Kaname Naito", tags: ["Japanese"], lang: true },
  { id: "UCu6sZrHyl4hSS2PvlUo2XZA", name: "Japanese with Shun", tags: ["Japanese"], lang: true },
  { id: "UCsQCbl3a9FtYvA55BxdzYiQ", name: "Miku Real Japanese", tags: ["Japanese"], lang: true },
  { id: "UCjSFDgRCzh_1ZPhxChVgK7Q", name: "Lazy Chinese", tags: ["Mandarin"], lang: true },
  { id: "UCa2MkPgQHW7hZC9E8xBk6fQ", name: "Story Learning Chinese with Annie", tags: ["Mandarin"], lang: true },
  { id: "UCTwUbtaSPl13qpT6sKB3dwA", name: "Yimin Chinese", tags: ["Mandarin"], lang: true },
  { id: "UCHxNPAnqTB4ohG5xl6MyuXg", name: "Easy Korean!", tags: ["Korean"], lang: true },
  { id: "UCb9kdZ3LKOTTcpp_1pw0o3g", name: "ChoiSusu", tags: ["Korean"], lang: true },
  { id: "UCmDctpxqbyedTLwi96_dyAA", name: "Dive Korean", tags: ["Korean"], lang: true },
```

That block has 34 topic channels plus 11 language channels. Trim to taste: the top-10 ones are the core. Each FOLLOW entry costs one RSS fetch per build, so about 45 extra serial fetches.

### TRUSTED (merge into the object)

These are high-volume research institutions, so they get topic credit through HN ranking only, not every upload in the feed.

```js
  "Simons Institute for the Theory of Computing": ["AI", "Math", "Computer Science"], "Fields Institute": ["Math"],
  "Institut des Hautes Etudes Scientifiques (IHES)": ["Math", "Physics"], "ICTP Mathematics": ["Math"],
  "Perimeter Institute for Theoretical Physics": ["Physics"], "YaleCourses": [], "CMU Database Group": ["Computer Science"],
  "Princeton Language & Intelligence": ["AI", "LLMs"],
```

The FOLLOW names above are display labels; TRUSTED keys must match the channel's oEmbed name exactly. For any channel added to both, use the exact feed title from `research-channels.md` as the TRUSTED key.

## Maybe

Each is held back for one reason:

- **Sebastian Raschka** (6/15 long-form, book promotion).
- **Hugging Face** (product marketing).
- **Aleksa Gordić** (quiet for 18 months).
- **Samuel Albanie** (quiet for 22 months).
- **Edan Meyer** (some opinion videos).
- **Alfredo Canziani** (7/15 Shorts).
- **Vizuara** (prolific, uneven, upsell).
- **sentdex** (gadget drift).
- **MIT 6.5940 Fall 2026** (in progress, short ID `PLH7PIPKvCm38`; duplicates F23).
- **Stanford CS330** `PLoROMvodv4rMC6zfYmnD7UG3LVvwaITY5` (the Stanford Online channel is already being added).
- **Sheafification of G** (joke register).
- **Stand-up Maths** (recreational).
- **Oxford Mathematics** (9/15 Shorts).
- **The Math Sorcerer** (book and motivation drift).
- **Walter Lewin**: excellent lectures, but MIT revoked his emeritus status in 2014 over a harassment finding. Owner's call.
- **Andrew Dotson** (slowing, vlog mix).
- **Physics Explained** and **Perimeter** as FOLLOW (mostly Shorts).
- **Arvin Ash** and **Quanta Magazine** (pop/journalism register).
- **Tsoding Daily** and **Molly Rocket** (stream and rant register).
- **Reducible** and **Andreas Kling** (inactive about 2 years).
- **Spanning Tree** and **Abdul Bari** (slow, upsell).
- **Invicta** (military focus).
- **History Matters** (short and shallow).
- **Nihongo no Mori** (8/15 Shorts).
- **Speak Japanese Naturally**.
- **Masa CI Japanese**, **Daily Korean with Jaerim** and **태웅쌤 CI Korean** (less established).
- **Sambon Juku** (slowing).
- **Mandarin Click** (finished 2024).
- **Chloe Chinese Class** (Shorts, membership).
- The **Yale Snyder "Making of Modern Ukraine"** playlist (sound scholarship, but war and politics).

## Rejected, with reason

- **Mostly Shorts (5/15 long-form or fewer):** Machine Learning Street Talk (3/15, also hype drift), Dwarkesh Patel (3/15), Stanford MLSys Seminars (2/15), Michael Penn (3/15), Gresham College (2/15), Physics with Elliot (2/15), Eugene Khutoryansky (2/15), The Royal Institution (5/15), Epic History (2/15), World History Encyclopedia (3/15), Xiaogua Chinese (2/15), Chinese Zero to Hero (2/15).
- **Hype or news:** Two Minute Papers, AI Explained.
- **Promotion, paywall or entertainment:**
  - DeepLearningAI: course ads; the real courses are on Coursera.
  - Zach Star: comedy drift.
  - Tasting History: entertainment, 10/15 Shorts.
  - Kings and Generals: war-centric, 8/15 Shorts.
  - JABZ and Drew Durnil: Shorts, pop register.
- **Inactive:** WilliamFiset (2023), Chinese For Us (2024-03, upsell), sarangkorean (2009).
- **Empty:** Korean Jun (empty feed).
- **Third-party re-uploads (not the official channel):**
  - Harvard Abstract Algebra `PLelIK3uylPMGzHBuR3hLMHrYfMqWWsmx5` ("It's so blatant").
  - 3Blue1Brown Linear Algebra and Calculus copies (imightberong).
  - Yale PHYS 200 copies (galaxy387, Willtech Online, Lily Cheang, Sjurnberry).
  - Cure Dolly all-videos copies (IM Gelfand; "That one dude who posted stuff").
  - Berkeley LLM Agents MOOC copies (Rishabh Gupta, Mahi_T, amit111978).
  - MIT 6.S184 copy (wang peng).
- **Not checked (`[unverified]`):** Comprehensible Japanese (CIJ), Cohere Labs, ICTP physics main channel, Catsters, BlaBla Chinese, Shenglan, Pronounce Korean. Listed in research-channels.md with the reason.

## How to apply (when approved)

1. Paste the blocks into `scripts/build.mjs`.
2. Run the build.
3. Check the log lines `follow <name>: N videos` and `course <name>: N videos`. Every new entry should be non-zero; a "feed failed" or "skipped" line means a dead ID.
4. Open `site/index.html` and look at one card per topic chip.

not implementing yet
