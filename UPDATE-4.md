# Update 4 — Play the angle

This update targets the reported stationary bots, missed hit feedback, oversized forearms and dead-player experience. It prepares the game for GitHub Pages, as requested, without replacing the existing ChatGPT Site publication.

## Navigation and bot decisions

The old exported links used the midpoint of an entire source polygon edge, even when the neighboring polygon only shared a small part of it. Several bots repeatedly approached unreachable points. Routes now use the actual overlapping portal, penalize awkward climbs and reject unreachable rises. Bots move through the original collision hull with acceleration, gravity, steps, jumping, local separation and recovery. Idle, blind and fighting bots retain gravity and friction.

Four difficulty profiles have separate reaction, view turn speed, aim error, head targeting, burst/rest timing, memory and utility decisions. Easy bots rush and have poor aim/throws. Stronger bots use quieter approaches, site roles, a flank, shared last-known calls, cover repositioning, crouched fire and steadier sniper shots. They use different team-legal rifles, SMGs and sniper rifles. A negative reload-timer bug that permanently disabled subsequent shooting is fixed.

Bots throw actual native grenade models through the existing grenade simulation. Hard and Expert check candidate trajectories against collision, avoid nearby teammates and turn away from their own flashes. This is a computed throwing solution, not a complete library of named community lineups. T bots plant; CT bots defuse, with kits. The native action bank contains 15 original crouch, reload, plant, defuse, flash, throw and death clips, verified against both character rigs. Static clips receive a finite runtime duration; their authored pose is unchanged. Initial poses apply during freeze time. Death no longer calls the binding reset that restored the T-pose.

## Combat and presentation

Animated skinned bounds refresh before shot queries. Bullets follow the camera sightline; the decorative weapon placement does not alter the shot ray. Confirmed damage can show a crosshair hit marker, alongside native flesh/helmet/armor sounds. Camera shake is configurable and responds to armored gun impacts and actual fall damage.

Player and stronger-bot bullets can penetrate thin surfaces with a paired exit on the same mesh. Loss depends on weapon penetration, estimated surface material and thickness. Unpaired walls and thick solid material stop the bullet. This is a bounded browser approximation of the historical Source formula, not authoritative Source 2 surface data.

The default hand/weapon group moves 0.29m toward the camera and slightly downward compared with Update 3. The pistol comparison was inspected against the supplied reference: hands fill the bottom-right frame and the long bare forearms are cropped. World FOV and camera line of sight are unchanged. Existing viewmodel sliders still work.

Native round-start music loops during freeze and stops when the round goes live. After death, first-person spectating follows living teammates; Space, arrow keys and mouse buttons cycle targets. Blur, visibility changes and pointer unlock release input without pausing. Escape pauses explicitly, including the browser's pointer-unlock key path. A worker clock advances the match when background rendering is throttled; a long browser suspension advances round clocks on return.

## Hosting and validation

The Pages workflow deploys the tested `strikepoint-web.zip` release artifact. This keeps the large native asset collection outside Git history. All runtime URLs are relative and were checked under a project subpath. No GitHub credentials are embedded in the game or release.

Validation includes the existing unit/data rules, the original 32 browser scenarios, the 24 Update 3 scenarios, new portal/penetration unit checks, actual aimed shooting, freeze/death poses, spectating, all nine bots leaving spawn, audible freeze music, fall impacts, reload recovery, background time, computed throws, bot planting and a complete bot-only round. Exact results are in `VALIDATION-UPDATE4.json`.

## Boundaries

This remains an unofficial, noncommercial browser adaptation using native Valve content. It is not the Source 2 executable, native multiplayer or Valve matchmaking. Full bot economy, exact native hitbox sets, complete animation graphs, material shaders, audio propagation and every weapon-specific third-person reload pose are not reproduced. Bot tactics and grenade planning remain browser implementations. The menu video mentioned in the request has not been received; the menu follows the existing native CS2 reference work and the supplied screenshots guided weapon framing.

Primary mechanics references: [native viewmodel offsets](https://github.com/perilouswithadollarsign/cstrike15_src/blob/master/game/shared/baseviewmodel_shared.cpp#L478), [bot vision](https://github.com/perilouswithadollarsign/cstrike15_src/blob/master/game/server/cstrike15/bot/cs_bot_vision.cpp#L334), [utility behavior](https://github.com/perilouswithadollarsign/cstrike15_src/blob/master/game/server/cstrike15/bot/cs_bot_weapon.cpp#L719), [historical penetration](https://github.com/perilouswithadollarsign/cstrike15_src/blob/master/game/shared/cstrike15/cs_player_shared.cpp#L1955), [GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
