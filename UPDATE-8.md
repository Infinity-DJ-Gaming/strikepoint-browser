# Update 8 — Native Detail

Skin texture conversion no longer erases RGB stored beneath packed zero alpha. The original 406 normal maps are restored. Finish data, color artwork and alpha are distinct inputs, and color/data texture-cache entries cannot share the wrong color space. Original weapon paint-by-number and no-paint inputs protect unpainted components; scope glass and sticker gaps are excluded. Paint style handling, per-color material properties, overlays, roughness, native case-hardening ramps and pearlescent masks are improved. Browser compositing is still an approximation of Source 2, including seeds, wear, projection and lighting.

Glove inventory inspection now binds the actual glove meshes to an independent hand rig and plays the original pedestal glove inspect animation in the native first-person camera frame. Both hands, wrap fingers and the native geometry remain visible. Drag changes the inspection angle; scrolling zooms. Closing or replacing an inspector releases its renderer and owned finish materials without disposing the shared originals.

The public build uses up to 1024px color patterns (quality 90), 512px lossless normal/data inputs, and original-resolution categorical maps. Glove RGB layers use up to 1024px lossless encoding. Packed varying alpha is lossless and uploaded as a single GPU channel. All assets are derived from the installed game, with provenance and exact original/delivery dimensions in assets/SKIN-TEXTURE-QUALITY.json. No cosmetic artwork was generated.

## Original-resolution mode

The complete local texture library exceeds GitHub Pages’ one-gigabyte site limit. An exported native texture folder is supplied separately. In the game, choose **Settings → Video → Attach Native Folder**, then select **strikepoint-native-textures**. Its native-texture-index.json and textures/ directory must stay together. No texture files are uploaded. Supported Chrome/Edge directory access can persist across sessions; fallback folder selection must be repeated per session.

Native mode decodes original largest-mip PNG RGB/alpha directly without Canvas premultiplication, resizing or a second image encoder. All finish recipe/layer inputs are covered, with additional native weapon composite inputs and finish channels. Embedded stock/substrate GLB textures remain optimized; this mode does not restore all map, character or engine shader inputs. Browser effects and native procedural twist bones remain approximations. Only the held weapon and gloves retain active finish textures, with a bounded inactive cache, so equipping many inventory slots does not pin every 4K texture in GPU memory.

## Validation

- 3,831 staged texture images decoded; 406 normal RGB, 284 categorical RGB, 380 other lossless RGB, 1,491 varying alpha and 21 derived tint maps match native channels at the documented delivery resolution.
- 68 firearm/knife finish samples cover every firearm, all 20 knife models and all catalog finish styles; eight glove families have animated first-person previews.
- Original 4096×4096 RGB and alpha compare byte-for-byte through the browser PNG loader; color/data cache separation and native folder rendering are verified.
- All 94 glove finishes, 98 weapon/model visibility transitions, scope behavior, playable aftermath, pickups and pooled ammunition are checked separately.
- See VALIDATION-UPDATE8.json for the executed results and limitations.

References: [Valve Workshop Finishes](https://www.counter-strike.net/workshop/workshopfinishes), [Source2Viewer format support](https://s2v.app/ValveResourceFormat/guides/format-support.html), [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits). Valve and the original Workshop contributors retain ownership.
