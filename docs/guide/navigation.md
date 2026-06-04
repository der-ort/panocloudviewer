# Navigation Modes

PanoCloudViewer supports three navigation modes that control how the camera responds to mouse and keyboard input.

---

## Overview

| Mode | Best for | Primary action |
|---|---|---|
| `orbit` | General inspection, CAD-style review | Left-drag to rotate around a target |
| `fly` | Walkthrough, interior exploration | WASD moves, mouse-drag looks |
| `earth` | Top-down / map-style view | Left-drag pans, scroll zooms |

Switch the mode programmatically:

```tsx
import { useNavigationActions } from '@der-ort/pano-cloud-viewer';

const { setNavigationMode } = useNavigationActions();

setNavigationMode('orbit');
setNavigationMode('fly');
setNavigationMode('earth');
```

Or via `setNavigationMode` from `useViewer()`:

```tsx
const { setNavigationMode } = useViewer();
setNavigationMode('fly');
```

---

## Orbit mode (default)

Uses `OrbitControls` with `screenSpacePanning=true` and `maxPolarAngle=π` (full sphere).

The camera tumbles around a fixed **target point**. All rotation is relative to that target, which stays at the center of the screen.

### Mouse mappings

| Input | Action |
|---|---|
| Left-drag | Rotate / tumble around the target |
| Right-drag | Pan (translate camera + target) |
| Middle-drag | Dolly (zoom) |
| Scroll wheel | Zoom toward cursor (zoom-to-cursor) |

The `rotateSpeed` is set to `-1` (negative) so that dragging up moves the camera up — this feels natural in a Z-up point cloud scene where the "up" axis is Z.

`maxPolarAngle=π` means the camera can go fully inverted (below the scene). There is no floor clamp in orbit mode.

---

## Fly mode

Uses a custom `FpsControls` implementation. `OrbitControls` is disabled while fly mode is active.

The camera moves freely in 3D space with no fixed target point. It is first-person / walkthrough style.

### Controls

| Input | Action |
|---|---|
| `W` / `S` | Move forward / backward |
| `A` / `D` | Strafe left / right |
| `Q` / `E` | Move down / up |
| Left-drag | Look (rotate view) |

Mouse movement only rotates the view while a mouse button is held (`dragToLook=true`). This prevents accidental view rotation when clicking UI elements.

### Speed scaling

Movement speed (`movementSpeed`) is automatically set proportional to the loaded point cloud's bounding box size after `PointCloudLoader.load()` completes:

```
flySpeed = maxDim / 20
```

This makes movement feel natural at any cloud scale — a building-sized cloud and a city-sized cloud both feel traversable at a reasonable speed.

### First-frame delta cap

On the first animation frame after switching to fly mode, the elapsed `delta` since the last frame may be large (e.g. if the browser tab was hidden). Without protection, FpsControls would compute a large position jump.

The frame loop caps the delta at 100ms:
```typescript
fpsControls.update(Math.min(delta / 1000, 0.1)); // cap at 100ms
```

This limits the first-frame movement to at most `movementSpeed * 0.1` units, preventing camera jumps.

---

## Earth mode

Uses `OrbitControls` configured for a map/top-down workflow.

`maxPolarAngle=Math.PI / 2.05` (just above 90°) prevents the camera from going below the horizontal plane. This keeps the camera above the scene like a traditional GIS or mapping tool.

### Mouse mappings

| Input | Action |
|---|---|
| Left-drag | Orbit (tilt slightly around target) |
| Right-drag | Pan |
| Scroll wheel | Zoom |

The combination of the polar angle clamp and `screenSpacePanning=true` produces a feel similar to Google Maps or Google Earth: scroll to zoom, drag to pan, and limited tilt.

---

## Setting the default navigation mode

Pass `navigationMode` in `ViewerConfig` or set it before Viewport mounts. Since `ViewerProvider` initialises with `"orbit"`, and Viewport syncs the provider's `navigationMode` to `SceneManager` on mount, you can set a different default by keeping state in a parent component:

```tsx
import { useState } from 'react';
import { PanoCloudViewer, ViewerProvider, useViewer } from '@der-ort/pano-cloud-viewer';

// Option 1 — programmatic after mount
function OnMountNav() {
  const { setNavigationMode } = useViewer();
  React.useEffect(() => { setNavigationMode('earth'); }, []);
  return null;
}

// Option 2 — use the WorkspaceLayout default controls
// (DisplayControls has nav mode buttons that default to orbit)
```

> **Note**: `ViewerConfig` does not yet have a `defaultNavigationMode` field — set the mode imperatively in a `useEffect` inside a child component of `ViewerProvider`.

---

## What happened to the flight-sim / WASD-always mode?

The previous `fly` mode used Three.js `FlyControls` which moved continuously while keys were held and tracked mouse position at all times. This has been replaced with the new `FpsControls` implementation (`fly` mode) which:

- Only looks when a mouse button is held (`dragToLook=true`)
- Does not require a pointer lock
- Works better alongside React UI (mouse can reach buttons without affecting the view)

The old `fly` (`FlyControls`) and `earth` (`OrbitControls` with Google-Maps feel) naming has been retained in the `NavigationMode` type for compatibility:

```typescript
type NavigationMode = "orbit" | "fly" | "earth";
```
