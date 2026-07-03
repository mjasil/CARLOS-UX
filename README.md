# Carlos UX

A small/big random generator app, built for Flovex — packaged as an
installable Android app using Capacitor.

## 📱 Get the APK (no computer needed)

1. Go to the **Actions** tab on this repo
2. Click the latest **"Build Android APK"** run (or **Run workflow** to trigger a new one)
3. Wait for it to finish (green check ✅)
4. Scroll down to **Artifacts** → download `carlos-ux-debug-apk`
5. Unzip it on your phone, tap `app-debug.apk` to install
   (you may need to allow "install unknown apps" for your browser/files app)

Every push to `main`/`master` automatically triggers a new build.

## Project structure

```
src/App.jsx            The live app (small/big generator, live wall-clock
                        timer, Carlos branding, sounds, animations)
src/logo-circle.png     Circular logo used in the popup
android/                Native Android project (Capacitor)
.github/workflows/      CI workflow that builds the APK in the cloud
demos/                  Earlier standalone component demos (reference only)
```

## Local development (optional, if you ever use a computer)

```bash
npm install
npm run dev          # preview in browser
npm run build        # build web assets
npx cap sync android # sync into the native project
```

## Notes

- All sound effects are synthesized in-browser via the Web Audio API.
- This is a random-outcome demo for entertainment only — not tied to any
  real-money prediction or betting mechanic.
- The debug APK is unsigned/for testing. For a Play Store release build,
  you'd generate a signing key and switch the workflow to `assembleRelease`.
