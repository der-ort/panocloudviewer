# Navigation Modes

PanoCloudViewer ships CAD/Blender-style camera navigation. There are three modes, all driven by a **single `OrbitControls` instance** that is reconfigured per mode — so the orbit target stays the one source of truth for clipping, the minimap, camera animation, and the orthographic-camera sync. There is no flight-simulator / WASD mode.

---

## Overview

| Mode | Best for | Primary action |
|---|---|---|
| `orbit` | General inspection, CAD-style review | Left-drag rotates around a target (turntable) |
| `free` | Free look, inspecting from any angle | Left/middle-drag rotates in any direction (Blender-ish) |
| `pan` | Top-down / map-style review | Left-drag pans, horizon stays level |

All three modes share:

- **Zoom-to-cursor** — the scroll wheel zooms toward the point under the cursor (`OrbitControls.zoomToCursor = true`).
- **Damping** — smooth, inertial motion (`enableDamping = true`).
- **Natural rotate direction** — `rotateSpeed` is positive (no inverted feel).

Switch the mode programmatically:

```tsx
import { useNavigationActions } from '@der-ort/pano-cloud-viewer';

const { setNavigationMode } = useNavigationActions();

setNavigationMode('orbit');
setNavigationMode('free');
setNavigationMode('pan');
```

Or via `setNavigationMode` from `useViewer()`:

```tsx
const { setNavigationMode } = useViewer();
setNavigationMode('pan');
```

---

## Orbit mode (default)

CAD-style turntable. The camera rotates around a fixed **target point** that stays at the center of the screen, with the Z axis kept up. Near-full-sphere rotation is allowed (`maxPolarAngle = π − 0.01`, clamped just shy of the pole to avoid the Z-up singularity flipping the view).

### Mouse mappings

| Input | Action |
|---|---|
| Left-drag | Rotate / tumble around the target |
| Middle-drag | Dolly (zoom in/out) |
| Right-drag | Pan (translate camera + target) |
| Scroll wheel | Zoom toward cursor |

---

## Free mode

Blender-style free orbit. Like orbit, but rotation is mapped to **both** the left and middle mouse buttons and the camera can swing fully around the target — handy for quickly inspecting a feature from any angle without re-centering.

### Mouse mappings

| Input | Action |
|---|---|
| Left-drag | Rotate (full sphere) |
| Middle-drag | Rotate (full sphere) |
| Right-drag | Pan |
| Scroll wheel | Zoom toward cursor |

---

## Pan mode

Map / top-down workflow. `maxPolarAngle = π / 2.05` (just under 90°) keeps the camera above the horizon, and left-drag pans the scene like a GIS/mapping tool.

### Mouse mappings

| Input | Action |
|---|---|
| Left-drag | Pan the scene |
| Middle-drag | Dolly (zoom) |
| Right-drag | Rotate (limited tilt, horizon-locked) |
| Scroll wheel | Zoom toward cursor |

---

## Touch (mobile / tablet)

3D navigation works out of the box on touch devices — `SceneManager` sets `renderer.domElement.style.touchAction = "none"` and OrbitControls has touch enabled by default:

| Gesture | Action |
|---|---|
| One-finger drag | Rotate (orbit) |
| Two-finger drag | Pan |
| Two-finger pinch | Zoom (dolly) |

Single taps place measurement / clip-box points (via synthesized mouse events), so the measurement and section tools are fully usable on a phone or tablet.

---

## Projection: perspective vs. orthographic

Projection is a **separate axis** from navigation mode — you can combine any navigation mode with either projection. Orthographic derives its frustum from the perspective camera's FOV and current orbit distance each frame, so switching is seamless and keeps the same framing.

```tsx
import { useNavigationActions } from '@der-ort/pano-cloud-viewer';

const { projection, setProjection } = useNavigationActions();

setProjection('orthographic');  // parallel projection — good for plans / elevations
setProjection('perspective');   // default
```

The view-preset buttons (`flyToView('top' | 'front' | ...)`) switch to orthographic automatically so plan and elevation shots are true parallel projections.

---

## Setting the default navigation mode

`ViewerProvider` initialises with `"orbit"`, and Viewport syncs the provider's `navigationMode` to `SceneManager` on mount. To start in another mode, set it imperatively from a child of `ViewerProvider`:

```tsx
import { useEffect } from 'react';
import { useViewer } from '@der-ort/pano-cloud-viewer';

function DefaultPanMode() {
  const { setNavigationMode } = useViewer();
  useEffect(() => { setNavigationMode('pan'); }, [setNavigationMode]);
  return null;
}
```

The default `WorkspaceLayout` also exposes orbit/free/pan buttons in its display controls.

---

## What happened to the flight-sim / WASD mode?

Earlier versions had a `fly` mode (custom `FpsControls`: WASD movement + drag-to-look) and an `earth` mode. Both are gone. The flight-sim feel was replaced with the robust single-`OrbitControls` design above:

```typescript
type NavigationMode = "orbit" | "free" | "pan";
```

Using one controller for every mode means there is never more than one controller responding to input, and the orbit target never desyncs from the rest of the system (clipping, minimap click-to-navigate, `CameraAnimator.flyTo`, and the ortho-camera frustum all read `controls.target`).
