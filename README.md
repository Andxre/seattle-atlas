# FIELDNOTES — Seattle Interactive City Atlas

A polished, interactive 3D visualization of Seattle as a miniature architectural diorama.

## Run locally

```bash
cd seattle-atlas
python3 -m http.server 8765
# then open http://localhost:8765/
```

Any static file server works (no build step, no backend).

## Controls

- Drag to orbit · Scroll/pinch to zoom
- Viewpoint selector (top right): City view, Space Needle, Waterfront, Downtown
- Toolbar (bottom): Auto-orbit, Daylight/Dusk, Zoom out, Zoom in, Reset

## Tech

- Three.js (WebGL) with OrbitControls, orthographic camera, shadow maps
- Vendored under `vendor/three/`
- Fonts via Google Fonts (Manrope, DM Sans) with system fallbacks
