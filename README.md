# Strikepoint · Browser practice

Unofficial, noncommercial Counter-Strike practice in the browser, using native Valve map, model, animation, texture and sound assets. This is an independent browser implementation, not the Source 2 executable or Valve matchmaking.

**Play:** https://infinity-dj-gaming.github.io/strikepoint-browser/

## Update 4

Navigation portals, collision movement, gravity, jump recovery, finite freeze poses and native death animations are repaired. Four bot difficulties vary aim, reaction, bursts, memory, utility decisions, cover movement and site roles. Bots use different team-legal weapons, throw physical grenades, plant and defuse. Stronger bots check throwing arcs and can penetrate thin paired surfaces.

The hand/weapon frame is closer, with the long forearms cropped. Confirmed hits have optional feedback; shots and falls cause configurable camera shake. Native music plays through freeze time. After death, Space, arrows or mouse buttons cycle first-person spectator targets. Leaving the tab releases input while the match continues; Escape pauses.

122 bounded desktop Edge checks passed, plus 30 native animation/character combinations. See the release's validation report and UPDATE-4.md for exact scope and limitations.

## Source and local use

The client JavaScript, HTML, CSS and native data catalogs are browsable here. The large native assets and bundled runtime libraries are distributed in the tested **strikepoint-web.zip** release asset rather than Git history. Download that final archive from Releases and extract it into one directory. Run `python -m http.server 4173` there, then open `http://127.0.0.1:4173/` in a desktop browser with hardware acceleration.

The Pages workflow downloads the final release archive and publishes its exact static contents. The preview archive is an earlier packaging pass; use strikepoint-web.zip.

## Controls and local inventory

WASD move, mouse aim, Shift walk, Ctrl crouch, Space jump, B buy, R reload, F inspect, E use/defuse, 1/2/3 weapons, 4 grenades, 5 C4, Escape pause. Controls are remappable. Ordinary guns do not ADS; eligible scoped guns zoom. Settings include graphics, audio, crosshair, HUD, bots and optional bunny hopping.

CSCoins, finishes and settings are local browser data, with no monetary value or Steam inventory connection. No real-money purchases or cashout exist. Browser storage is specific to the website's origin.

## Ownership and fidelity

Valve and the original contributors retain ownership of their game content. Conversion does not grant an open-source asset license. No game models or sound recordings were generated. Attribution and source hashes are included in the release. The user-provided historical CS:GO source informed browser rules; the C++ engine was not compiled into the game.

Bots, grenade planning, hitbox/material approximations, animation retargeting, lighting, finishes and audio propagation are not bit-for-bit Source 2 behavior. There is no native multiplayer, Steam matchmaking or full bot economy. See UPDATE-4.md and the included asset notices.
