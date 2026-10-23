# Update 10 — The Island Experiment

October 23, 2026

Open **Play → Battle Royale · Experimental**, or `royale.html`.

- Original archived Chapter 2 Season 2 / 12.00 island heightmap and minimap.
- Original converted Battle Bus, seven Chapter 2 tree models, building pieces, glider reference model and building sounds. No AI-generated models or recordings.
- 100 total combatants. Solo starts with 99 bots; private BR rooms and regional room discovery allow up to 10 humans, with bots filling the remaining places.
- Bus travel, first-person skydiving/gliding, world loot, five inventory slots, pooled ammunition, shields, healing, storm circles, eliminations, spectating and a victory result.
- Native CS2 firearm parameters, recoil data, movement, weapon meshes, hand animations, reload recordings, damage hit groups, tagging and material penetration. Scoped rifles use the native optic ring and green dot; ordinary firearms do not aim down sights.
- Wood, brick and metal walls, floors, ramps and cones. Rotation, material selection, turbo placement, harvesting and wall/floor tile edits. Building dimensions use the documented Fortnite grid.
- Remappable BR controls. Existing CS2 sensitivity, crosshair, viewmodel, audio preferences, equipped weapon/knife/glove finishes and optional original-resolution texture-folder mode carry over.
- Existing Firebase accounts and private cloud saves retain skins, coins, BR counters and BR controls across devices. Lobby microphone setup and voice/chat use the existing WebRTC transport. The selected native CS2 MVP kit plays for a local BR winner.
- Updated home card and expandable patch notes. Dust II remains a separate mode.

## Controls

WASD move; Space jumps from the bus / deploys the glider / jumps on foot. Shift walks; Ctrl crouches. E picks up nearby loot. R reloads. G drops the selected item. 1 selects the knife; 2–6 select the five inventory slots. Mouse wheel cycles occupied slots.

Q toggles building. Z/X/C/V select wall/floor/ramp/cone. In building mode, R rotates, right-click changes material and F edits your own wall/floor. Select tiles in the editor, then Confirm (F) or Reset (R), using the default bindings. Left-click places a build; holding repeats when turbo building is enabled. Knife hits can harvest nearby trees.

M opens/closes the map; click it to place a waypoint. Tab opens/closes the inventory. Esc opens the menu. Solo pauses only through that menu; online play continues. Unfocusing the tab does not pause the simulation. After death, click or use the arrow keys to cycle living players. K is push-to-talk after enabling the microphone in the lobby.

## Experimental boundaries

The landscape and map image are original archived assets. **Complete original Season 12 town buildings, interiors, actor placements and water volumes were not obtained.** The current compounds are reconstructed layouts built from native pieces. The original map image therefore contains buildings and landmarks that the playable compounds do not reproduce.

Storm schedules, drop/glide physics, loot distribution, building edits and terrain materials are browser prototype implementations. The glider conversion retains its folded reference pose; its original deployment animation was unavailable. Buildings and water levels require further fidelity work. Consumable/ammo markers currently use simple fallback geometry. Meshes and recordings are original conversions, while browser lighting and optimized web textures approximate Unreal/Source rendering.

This is first-person CS2-style combat on the island, with native Source-compatible recoil data; it is not a port of either closed-source game engine. See `RECOIL-PROVENANCE.md` for the existing recoil boundary.

**100 total does not mean 100 humans.** The existing host/client transport supports 10 human slots. The host runs the simulation and must stay connected. A dedicated authoritative server, 100-human scaling, host migration and production anti-cheat are not included. WAN/relay performance and large live rooms remain unverified; automated multiplayer validation used two local browser clients over real WebRTC.

## Asset provenance

`assets/royale/terrain-provenance.json` records archive sources and transforms. `assets/royale/models.json` / `asset-manifest.json` and `CREDITS.json` record converted original models, sounds, credited Source ports and content hashes. Original Fortnite assets belong to Epic Games; Counter-Strike assets belong to Valve. The material conversion is an approximation, and the archive/port providers do not make this an official Epic or Valve release.

## Publishing

The GitHub Pages workflow already publishes the repository root on a push to `main`. These files are placed directly in that root, alongside the existing game. No new Firebase rules or paid services are required for Update 10. Existing account, room and cloud-save rules remain in use.
