# Update 7 · After the Round

Play https://infinity-dj-gaming.github.io/strikepoint-browser/?update=7

Round decisions now lock the winner immediately, then leave five seconds for movement, combat, grenades, dropping weapons and recovery. A small result/MVP banner leaves the view playable. The host automatically starts the next round; guests follow its countdown and score. Post-round deaths do not award another round or change the MVP. Dead players lose equipment at the next spawn, so dying during the aftermath matters. Survivors retain their current weapon ammunition. Bomb explosions apply radial damage and leave surviving opponents available to fight during the aftermath. Blast propagation remains a browser approximation.

Reloads use classic pooled reserve bullets. Reloading 7/90 into a 30-round rifle becomes 30/67; reloading 7/3 becomes 10/0. Unfired rounds are retained. Dropped and recovered weapons carry their actual magazine and reserve, including same-weapon swaps. Drop no longer creates a free pistol; Use swaps an occupied slot, while walking directly over a gun can fill an empty slot. Bot deaths also drop their held firearm. The HUD shows magazine / reserve bullets.

Inventory has prominent Knives, Gloves and Weapons categories with counts. The native catalog contains **576 knife finishes across 20 knife families**, including the finishes already granted to the verified testing account. A case's gold Special Item card now opens its complete native rare pool, with owned-item equip and native 3D inspection. Special items retain the existing 0.256% rarity weight. No rare drop is guaranteed. The test-inventory migration checks individual missing finish IDs, and remains idempotent and scoped to the verified tester.

The Store now offers **20 music kits**, including two free Valve defaults and 18 Classics. Purchase with CSCoins, preview the native MVP recording, and equip a kit. Classics include **The Verkkars, EZ4ENCE** and **The Verkkars & n0thing, Flashbang Dance**. The winning team's round MVP and selected anthem are shared with guests. The original installed `.vsnd_c` MP3 payloads were copied unchanged, not generated or downloaded from a music-streaming service. The Audio settings include MVP music volume. Prices are local CSCoins prices, not Steam prices. A static browser inventory does not provide secure item ownership.

Profiles can choose from twelve original CS2 agent portraits plus team emblems. Firebase validates the allowlist; arbitrary picture uploads are unavailable. This is a curated picture system, not an automated moderation service. Player search accepts case-insensitive username prefixes of at least two characters, with a bounded twenty-result query. Friend codes continue to work. Names are not unique, so results show their friend code. Returning accounts enter the search index when they next sign in. Profile editing remains owner-only; private email/password data is not stored in public profiles.

Glove rendering now reads native layer masks, palette-ID maps, pattern-enable flags and textile color layers. The native textures pack material data into alpha, including images whose meaningful RGB pixels have zero alpha. Their RGB and palette alpha are exported as separate opaque maps before resizing, preventing WebP and browser decoders from discarding the artwork. Native normals and patterns are retained. Bare-hand/finger primitives beneath hand wraps remain visible on both CT and T; CT sleeves still show, and custom gloves remain equipped when teams change. The browser compositor approximates Source 2 wear, lighting and cloth effects.

AUG and SG 553 use their original animated rifle models aligned to the native lens plane, an optical opening and the original scope-dot texture tinted green. Snipers keep their distinct full-screen scope treatment. Rifle zoom uses the native 45-degree setting. This does not add ADS to ordinary weapons. Geometry, reticle and sounds are native; WebGL optical masking approximates the engine's effect.

## References and verification

- Original installed CS2 `pak01_dir.vpk`: weapon meshes, optic lens materials, scope-dot texture, glove composite material inputs, agent portraits and MVP recordings. Asset provenance files include original paths and content hashes.
- Valve's EZ4ENCE announcement: https://blog.counter-strike.net/2019/03/23717/
- Original Flashbang Dance music kit listing: https://steamcommunity.com/market/listings/730/G18A20A300488013D
- AUG framing comparison inspected visually: https://x.com/Jackyesports/status/1716879897833189701
- Rifle scope gameplay reference: https://x.com/Ozzny_CS2/status/1884388951386997222
- Historical CS:GO weapon reference: https://github.com/perilouswithadollarsign/cstrike15_src/blob/master/game/shared/cstrike15/weapon_csbase.cpp
- Firebase bounded query rules: https://firebase.google.com/docs/database/security/rules-conditions

Validation includes pooled/partial reloads, drop and pickup ammunition, post-round movement and kills, automatic transitions, knife catalog and case pools, native music purchase/equip/MVP playback, hand-wrap skin/fingers, current and legacy glove shaders, native weapon visibility, username lookup and curated avatar persistence, access-control rejection tests, and two-/three-browser WebRTC gameplay and party audio. Test microphones use synthetic browser test devices; no real microphone was captured. Rules were tested in Firebase emulators before publication. Browser playback still requires a visitor gesture.

Firebase remains on Spark; Metered uses the existing shared free allowance. No billing changes or new provider credentials. This remains an unofficial browser-hosted game with local cosmetics, no Steam inventory connection, no dedicated authoritative server and no ranked anti-cheat. Source 2's native engine, animation graphs and exact renderer are not reproduced.
