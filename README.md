# Carlos UX

React component demos — in-app popups, sound-driven UI, and a small/big random
generator with a real-time wall-clock cycle. Built for Flovex.

## Structure

```
src/
  popup-demo.jsx          Basic in-app popup (button opens a modal)
  popup-demo-full.jsx     Popup with particles, glow, synthesized sound
  coin-toss.jsx           Standalone heads/tails game
  start-popup-toss.jsx    Coin toss embedded inside a popup
  cyber-toss.jsx          Cyberpunk-styled heads/tails popup
  small-big-call.jsx      Small/Big pick-a-side game
  small-big-reveal.jsx    Small/Big random reveal, round-based, 1-min cooldown
  small-big-square.jsx    Latest version — square popup, live wall-clock timer,
                           Carlos branding, logo animation, sparkle burst,
                           result history dots
assets/
  logo-circle.png         Circular cropped logo used in the popup header
```

## Notes

- All sound effects are synthesized in-browser via the Web Audio API — no
  external audio files needed.
- `small-big-square.jsx` expects `logo-circle.png` to be importable from your
  app's own asset pipeline, e.g.:

  ```jsx
  import logo from "../assets/logo-circle.png";
  // then use <img src={logo} ... />
  ```

- These are random-outcome demos for entertainment only — not tied to any
  real-money prediction or betting mechanic.

## Requirements

- React 18+
- `lucide-react` for icons
- Tailwind CSS (utility classes used throughout)
