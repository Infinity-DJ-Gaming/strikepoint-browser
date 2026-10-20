# Update 6 · Ready. Set. Equip.

Play https://infinity-dj-gaming.github.io/strikepoint-browser/?update=6

Animated weapon meshes no longer use stale frustum bounds during draw, reload or purchase. Temporary helper bones are marked as owned by a particular binding, so a replacement cannot adopt bones that cleanup will detach. The initial native rig and equipped finishes complete before Play becomes available. Stock Dual Berettas use the compatible original legacy mesh with the native hand clips. No new weapon models were generated.

Stock CT hands show the native SAS hard-knuckle gloves and blue sleeves already contained in the original arm asset. Stock T hands show the native fingerless gloves and bare arms. Custom glove finishes override both teams. Finish signatures include the actual inventory item, wear and pattern seed, so switching between two copies of the same finish updates its appearance.

Enable Microphone in Multiplayer before joining a room. It remains muted until **K** is held. Party members can talk and use Party text before queueing. A separate party connection uses the existing Metered ICE configuration and protected `partySignals` Firebase records; only roster members can send to each other. The microphone remains ready when a party enters a match. Disable Microphone stops capture; signing out also stops it. Team/Party/All routing, individual mute and receive volume remain available. A real visitor grants microphone permission themselves.

Case opening now uses synchronized normal and magnified reels, circular masking, original sounds, a six-second native cubic Bézier and a center selection bar. The result uses the actual native model and existing finish recipe in a rotatable 3D inspector. Drag to rotate, scroll to zoom. Inventory inspection also uses this renderer. Rewards are chosen once by the case transaction; the visual reel does not reroll the item.

The designated verified tester account receives all **2,147** native catalog finishes, additional permitted wear samples, three of each case and 100,000 testing CSCoins once per browser/account. The real native Negev `dev_texture` finish is included. The address is compared by digest rather than published in clear text. Test finishes are scoped to the signed-in tester in the active local inventory and are removed on sign-out. This is a local cosmetic testing feature, not administrator access, Steam inventory or an item with monetary value. Google sign-in supplies verified email; email/password users must verify their address and reload.

## Reference and verification

The installed game's reconstructed native Panorama `popup_capability_decodable.xml` and `.css` provide the two reel layers, 320/360 pixel card ratio, six-second timing and `cubic-bezier(0.075,0.82,0.165,1)` reference. Sources were read from the user's installed native game through Source 2 Viewer. An online gameplay reference was also located: https://steamcommunity.com/sharedfiles/filedetails/?id=3535670738 . The browser renderer approximates Source 2 lighting/materials and the full native inspect stage; it is not an exact Source 2 implementation.

Validation covers normal draw transitions without Repair, actual buy-menu purchases, stock/skin/knife pixel visibility, CT/T and custom glove visibility, party audio before queueing, continuity into matches, real RTP with fake microphones, Metered forced relay, protected signalling rules, 3D reward inspection, and tester grant isolation/idempotency. Real visitor Google consent is not automated.

The existing casual-host trust limits, browser-local inventory and shared 500 MB Metered trial cap remain. No billing settings or provider credentials were changed for this update.

One local direct-connection readiness run timed out while ICE reported connected. A fresh three-browser run passed all checks; connection success on every browser/network is not guaranteed. The forced Metered relay run passed.
