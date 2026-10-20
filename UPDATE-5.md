# Update 5 · Bring your squad

## Play

Open https://infinity-dj-gaming.github.io/strikepoint-browser/?update=5 in a desktop browser with hardware acceleration. Choose **Multiplayer**. Google and Email/Password sign-in use the dedicated Firebase project. Choose a display name and broad region; your public friend code appears on your profile. Your email never appears in a public profile or lobby.

**Friends:** add a friend code; the recipient must accept. Invite an accepted friend to your room or party. Online presence is visible to accepted friends.

**Private rooms:** create a room, share its eight-character code, and join from another computer. Ready up on both sides; the host starts when connections and game assets are ready. Ten fixed player slots support five per side. Empty slots can be filled by bots.

**Parties:** create a party, invite up to four friends or share its code, then ready up. The leader selects Find Match as Party. Accepted members automatically join the same team. A second party can join the opposing side of an open regional room. If nobody is available, your room waits for real players. Parties survive returning from a match lobby; the party leader can queue again.

**Voice:** enable the microphone in Multiplayer or Escape → Voice & Chat. Hold **K** to transmit. Choose Team, Party or All, set receive volume, or mute individual players. Releasing K, changing focus or opening text chat mutes transmission. Disabling the microphone or leaving the room stops capture. Voice is routed by the player hosting the match. No camera is requested.

**Text:** **Y** opens All chat and **U** opens Team chat. Enter sends; Escape closes chat. Messages use text nodes and are limited/rate-controlled by the host. They are not saved to a cloud message history. Voice and chat bindings are remappable in Controls.

## Gameplay and weapon views

The host validates movement with the existing hull physics, ownership and buy zones, purchases, ammunition, shooting, hit traces, grenades, planting, defusing, deaths and round results. Guest movement is predicted locally and corrected from snapshots. Reliable control messages carry actions and chat; an unordered data channel carries inputs and snapshots. A bot takes over a disconnected guest. The room ends when its host leaves. Player-owned guns can be dropped and picked up through the host.

Held-model visibility is synchronized explicitly. Equip actions apply the native pose immediately; skin replacements stay hidden until ready. Native helper bones are removed with their previous binding. All application modules use a new version to avoid mixing cached revisions. Settings → **Repair Weapon View** rebuilds the original hand and weapon rigs and restores standard view offsets while retaining finishes and inventory.

Google/email accounts, profiles, friend relationships and parties use Firebase Authentication and Realtime Database. WebRTC uses direct links when available and Metered TURN otherwise. Only the credential-scoped, documented browser Get Credential key is published. No account-management or server secret is in the static game.

## Validation

The included validation report records the actual completed checks. Firebase Auth and Database emulators isolate test identities and data. Browser tests use separate Edge storage contexts and real WebRTC data channels. Voice tests use a fake microphone and verify actual RTP delivery, sender identity, push-to-talk muting and team/party routing. A forced-relay test disables direct ICE candidates and verifies Metered relay candidates. Render-target checks count actual weapon pixels for stock models, legacy finishes, every cosmetic knife and rig recovery. These are bounded checks, not a claim of a perfect Source 2 implementation.

## Limits

- This is casual browser-hosted play. A modified host can cheat. There is no trusted ranked ladder or dedicated server, host migration, Steam matchmaking or Steam inventory connection.
- Matchmaking groups a manually selected broad region. It does not request precise location or guarantee the lowest-ping opponent.
- CSCoins, finishes and practice stats remain browser-local and have no monetary value. Account/profile/social data persists in Firebase. Different signed-in accounts on the same browser currently share that browser's local cosmetic inventory.
- The existing Metered TURN trial has a shared **500 MB monthly allowance**, initially about 13 MB used. Service stops at the free-plan cap. No plan upgrade, payment or auto-reload change was made. Multiple games in that Metered workspace share the allowance. Firebase remains on Spark.
- The map, models, hand clips, interface assets and recordings remain from the installed games. Lighting, finish rendering, bot tactics, shared third-person weapon poses, material penetration, audio propagation and some weapon behaviors remain browser approximations. Existing asset provenance and ownership notices still apply.
- Google provider activation and the authorized Pages domain are verified in the Firebase console. Automated account and rules tests use emulators; a real visitor completes Google consent and microphone permission themselves.
