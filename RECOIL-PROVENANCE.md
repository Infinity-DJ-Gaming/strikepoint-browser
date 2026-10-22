# Native recoil data / Update 9

Extracted 2026-10-22 from this user's installed CS2:
- `D:/SteamLibrary/steamapps/common/Counter-Strike Global Offensive/game/csgo/pak01_dir.vpk`
- Native member `scripts/weapons.vdata_c`, CRC `00b6efe34a`, compiled size 32731.
- Decompiled with existing `work/tools/vrf/Source2Viewer-CLI.exe -i <vpk> -f scripts/weapons.vdata_c -o weapons.vdata -d`.
- Installed steam.inf: ClientVersion/ServerVersion 2000934; PatchVersion 1.41.9.1; SourceRevision 11150591; VersionDate Oct 20 2026.
- Decompiled vdata SHA256 `46e7a84b46c620e8daf11c403ee9152a5faa1a033407748b527862aa3147236b`.
- 36 concrete classes: 35 existing normal firearm/taser classes plus `weapon_m14` present in installed data. Do not assume the extra m14 entry is exposed in the current game/loadout simply because its data exists.
- Native profiles are already fully expanded by VRF; extracted concrete class fields and retained both primary/alternate mode values. No arrays were traced from screenshots, fitted, hand-drawn, or invented.

## Files/API

`native-weapon-profiles.json`: all expanded native numeric/string fields for every firearm/taser.
`recoil-profiles.json`: reduced recoil/accuracy/recovery inputs with native values.
`recoil-data.mjs`: same reduced data plus Source-compatible float32 generator:

```js
import {NATIVE_RECOIL_PROFILES, generateRecoilTable} from './recoil-data.mjs';
const primary = generateRecoilTable('weapon_ak47');
const scoped = generateRecoilTable('weapon_sg556', {mode:1});
// 64 entries, each {angle,magnitude,x,y}; x=sin(angle)*magnitude,
// y=cos(angle)*magnitude. THESE ARE TABLE IMPULSES, NOT DEGREES OF
// ACCUMULATED BULLET DEFLECTION. Do not put them directly on shot direction.
```

Runtime alias mapping: `rifle` => `weapon_ak47`; `pistol` => `weapon_deagle`; other weapon keys => `weapon_` + key.
`generateRecoilTable(profile,{mode})` supports the compact native profile above or an ARSENAL-like *flat* primary profile. For ARSENAL alternate mode pass its alternate object merged with seed/automatic explicitly; native compact profiles already store mode arrays correctly.
`recoveryTime`, `decayRecoilIndex`, `decayAimPunch` provide documented legacy compatibility implementations.

## Primary/code references

- Native field schema (an extracted native class representation): https://s2v.app/SchemaExplorer/cs2/server/CCSWeaponBaseVData
- User-requested CS:GO source reference: https://github.com/perilouswithadollarsign/cstrike15_src/blob/master/game/shared/cstrike15/cs_weapon_parse.cpp#L1240-L1389
- Source table length from header: https://github.com/perilouswithadollarsign/cstrike15_src/blob/master/game/shared/cstrike15/cs_weapon_parse.h (`recoilTable[2][64]`). A copy is saved here.
- Source RNG: https://github.com/perilouswithadollarsign/cstrike15_src/blob/master/vstdlib/random.cpp
- Official Valve RNG declaration (32-entry shuffle): https://github.com/ValveSoftware/source-sdk-2013/blob/master/src/public/vstdlib/random.h
- Punch decay: https://github.com/perilouswithadollarsign/cstrike15_src/blob/master/game/shared/cstrike15/cs_gamemovement.cpp#L791-L830
- Legacy recoil convars/index recovery: https://github.com/perilouswithadollarsign/cstrike15_src/blob/master/game/shared/cstrike15/weapon_csbase.cpp#L85-L95 and #L3740-L3752
- Native follow recoil description: https://github.com/SteamTracking/GameTracking-CS2/blob/master/DumpSource2/convars.txt (also local `work/reference/cs2-convars-current.txt`): `cl_crosshair_recoil` = "Crosshair follows the weapon's predicted recoil (aim punch)".

## Exactness boundaries

Native weapon data values are directly extracted. The seeded table generator is a float32 implementation of the available CS:GO source (including preserving draw order for zero-variance random calls). It has been independently compared to a compiled C++ implementation for all 36 native profiles and both modes: 4608 impulse rows / 9216 angle-magnitude float32 values match exactly, zero mismatches. See validation.json, validate.mjs, reference-generator.cpp.

The current CS2 executable is closed source; this research does not prove its generation, angular integration, subtick timing, random spread, or recovery are bit-identical to that old source. The CS:GO reference `CWeaponCSBase::Recoil()` body is explicitly removed for the partner depot. Therefore do not advertise this as verified bit-exact current CS2 physics. RecoilScale=2, suppressionShots=4, suppressionFactor=.75, variance=.55, decayAngleExp=8, decayAngleLin=18, velocityDecay=4.5, indexDecayCoefficient=2 are SOURCE DEFAULTS, not currently re-extracted CS2 convars. Current publicly dumped CS2 convars no longer list weapon_recoil_*.

Native recoil magnitudes are NOT bullet-angle degrees (AK's value30 should never become a30-degree bullet kick). Angular integration requires a source-compatible punch/velocity model, then the shot uses punch plus input direction. Random movement/fire inaccuracy is separate and must not be displayed as deterministic recoil.

Follow-recoil should project the same current pre-random-spread shot direction into the actual render camera at its current FOV/aspect. When the render camera already incorporates some recoil, project using the difference: never apply that same punch twice. The crosshair follows aim punch, not each random bullet spread sample.

## Existing mechanics bugs found

- Existing generator ignores recoilMagnitudeVariance entirely (all nonzero variance firearms lose their native magnitude pattern, e.g. Desert Eagle18).
- It omits alternate/scoped/silenced recoil inputs.
- It calculates in double precision and uses weighted addition rather than Source's `A+(B-A)*t` float32 Lerp sequence.
- Existing recursive early-shot suppression is CORRECT relative to this source. Suppressed magnitude feeds the next iteration smoothing. Do not move suppression to a post-write step.
