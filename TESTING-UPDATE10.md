# Update 10 validation

The game is static HTML + ESM; no build step is needed. Serve the repository root with `python -m http.server 4181 --bind 127.0.0.1` and open `/royale.html`.

Pure tests use Node with the existing `tests/three-loader.mjs` vendor resolver:

```
node --test --loader ./tests/three-loader.mjs tests/royale.test.mjs
```

Browser tests require Playwright and Edge/Chromium. Install Playwright locally for testing, then run the `royale-*-browser.mjs` scripts. The browser tests expose test hooks only through `?test=1` and use loopback port 4181.

Online/cloud tests require the Firebase Auth and Realtime Database emulators on 9099/9000, project `demo-strikepoint`. Their database URL intentionally uses `demo-strikepoint-default-rtdb` so they exercise the deployed-style rules loaded by the Firebase CLI, rather than an unconfigured permissive emulator namespace. They use disposable local identities and no production account credentials. Online tests substitute empty ICE servers to exercise a direct local WebRTC connection; production still uses the existing Metered credential provider.

Validation results and exact checks are recorded in `VALIDATION-UPDATE10.json`. The original complete regression suite covers Dust II navigation, physics, combat, native catalogs, economy, online protocol, recoil and cloud merges in addition to the new BR tests.
