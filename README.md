# Strikepoint · Browser practice

Unofficial, noncommercial Counter-Strike practice and casual multiplayer in the browser, using native Valve map, model, animation, texture and sound assets. This is an independent browser implementation.

**Play Update 10:** https://infinity-dj-gaming.github.io/strikepoint-browser/?update=10

**Apollo Royale:** https://infinity-dj-gaming.github.io/strikepoint-browser/royale.html?update=10

Experimental Chapter 2 Season 2 island crossover: original terrain, minimap, bus, foliage and building pieces with first-person CS2 combat. 100 total combatants, up to 10 humans with bot fill. POI compounds are reconstructed; the complete original season map buildings are not included. See [Update 10](UPDATE-10.md) for controls, provenance and prototype limits.

## Multiplayer

Google/email sign-in, curated agent profile pictures, username search, friend codes, accepted friend requests, presence and invitations use Firebase. Create a private room or find a real open room in your selected region. Up to five friends can form a party and queue on the same team. Ready up, then let the host start. Bots can fill empty 5v5 slots. WebRTC carries gameplay; Metered TURN relays connections that need it.

Enable the microphone in the lobby before joining a room. Party voice and Party text work before queueing. **K** push-to-talk after enabling the microphone. **Y** All text chat. **U** Team text chat. Voice supports Team, Party and All channels, per-player mute and receive volume. Escape opens the match menu. The online match continues while its menu is open. Local practice still pauses explicitly with Escape.

WASD move, mouse aim, Shift walk, Ctrl crouch, Space jump, B buy, R reload, F inspect, G drop, E use/defuse/pickup, 1/2/3 weapons, 4 grenades, 5 C4. Controls are remappable. Ordinary guns do not ADS; eligible scoped weapons zoom. Settings cover graphics, audio, crosshair, HUD, bots and local bunny-hop practice.

Rounds have a five-second playable aftermath before automatically advancing. Shoot surviving opponents, drop equipment, and use E to recover guns. Reloads use classic pooled reserve bullets and preserve partial magazines. The Knives inventory category exposes all 576 native knife finishes; each case’s gold card opens its rare pool. The Store includes 20 original MVP music kits and previews, including EZ4ENCE and Flashbang Dance.

Weapon selection now applies native poses immediately and synchronizes the visible model. **Settings → Repair Weapon View** rebuilds the cached native rig and restores standard offsets without deleting inventory.

See [UPDATE-8.md](UPDATE-7.md) for operation, validation and limitations.

## Local use and source

Client JavaScript, HTML, CSS, native data catalogs and Firebase rules are browsable in this repository. Large native assets and bundled runtime libraries are in the tested **strikepoint-web.zip** release asset. Extract it into one directory, run `python -m http.server 4173`, then open http://127.0.0.1:4173/ in a desktop browser. The Pages workflow publishes the exact static release archive; use the final archive rather than an earlier preview.

The complete development checkout and validation report are also delivered as local artifacts. Firebase rules live in `firebase/database.rules.json`. `dist/online-config.mjs` in the development checkout contains the public Firebase app identifiers and the documented browser-scoped Metered credential key. It contains no admin/server management secret. The public static source uses the same modules at repository root.

## Persistence and limits

Profiles and social data persist in Firebase; CSCoins, finishes and practice stats remain browser-local, have no monetary value and are shared by accounts using that browser. There are no real-money purchases, cashout or Steam inventory transfers. A browser host can cheat; this is casual play with no trusted ranked results, dedicated server or host migration. Matchmaking uses a selected region, not precise location.

Metered uses the existing shared 500 MB trial allowance; relay service can stop at the cap. No billing upgrade was made. Firebase remains on Spark. Voice requires the user's own microphone consent.

Valve and the original contributors retain ownership of their content. Conversion does not grant an open-source asset license. No game models or sound recordings were generated. Native provenance and source hashes are included. Historical CS:GO source informed browser rules; its C++ engine was not compiled into the game. Browser lighting, finishes, bot tactics, animation retargeting, penetration and audio propagation approximate Source behavior. See the included asset notices.


Update 8 restores native packed material channels, improves public skin textures and uses the original animated first-person glove inspection. Settings → Video → Attach Native Folder enables original-resolution finish inputs from a local exported library. The public web build stays below GitHub Pages’ size limit; the complete original texture library remains local. See UPDATE-8.md for exact quality boundaries and validation.
