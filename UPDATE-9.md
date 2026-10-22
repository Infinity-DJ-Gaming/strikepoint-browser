# Update 9 — Control the Spray

- Native recoil seeds and primary/alternate weapon inputs; seeded angle and magnitude variance, early-shot suppression and recoil recovery. The same pre-spread aim direction drives shots and Follow Recoil projection at the actual camera FOV/aspect. Host/guest fire share this implementation.
- Dropped firearms inherit movement, tumble, collide with native map geometry, bounce and settle. Host snapshots synchronize their position/orientation. Magazine and pooled reserve ammo survive pickup.
- Expandable, keyboard-accessible patch notes. The newest update opens first.
- Free **AK-47 | Black Ice** community finish, based on the supplied concept, in My Items. Procedural sharp ice fissures use the original native AK model; this is custom browser artwork, not an official Valve finish. Includes in-game and interactive 3D previews.
- Private Firebase account saves across devices: coins, owned skins and exact item floats/seeds/StatTrak counters, equipment, cases, music kits, combat stats, loadouts and settings. First sign-in imports this browser's existing guest progress once. Signed-out guests remain local.
- Persistent offline outboxes, independent tab writers, transaction-based merging, duplicate-purchase/grant protection, account separation and visible save/retry status. Wait for **CLOUD SAVED · All devices** before closing a device with pending progress.

## Validation

59 unit checks pass. Native Source-compatible seeded generation matched 9,216 angle/magnitude values from an independently compiled C++ reference. Five native gameplay/render checks, eight independent cloud browser checks, seven full-game cloud/multiplayer integration checks, and existing access-rule regression checks passed. Private playerSaves rules published and read back from Firebase.

## Accuracy boundary

Per-weapon input values were extracted from the installed CS2 build. The seeded generator matches the available CS:GO source reference. Current CS2's closed-source angular integration, prediction/subtick timing and recovery cannot be independently verified bit-for-bit; the browser punch integration is a Source-compatible approximation. Random bullet spread remains separate from deterministic recoil, and Follow Recoil follows aim punch rather than random spread. Physics are swept browser prop physics, not the closed Source 2 rigid-body solver.

Native textures/assets remain from Update 8. No original Valve asset is replaced by generated content. Black Ice is a separate user-requested custom finish.
