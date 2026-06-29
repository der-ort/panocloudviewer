import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/** Easing curves for fly-to / keyframe animations. */
export type Easing = "smooth" | "linear" | "easeInOut";

const EASINGS: Record<Easing, (t: number) => number> = {
  smooth: (t) => 1 - Math.pow(1 - t, 4), // quartic ease-out (default)
  linear: (t) => t,
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
};

interface AnimOptions {
  position: THREE.Vector3;
  target: THREE.Vector3;
  /** Camera up vector to restore (prevents tilt when presets changed it). */
  up?: THREE.Vector3;
  duration?: number; // ms, default 800
  easing?: Easing;
}

/** Smooth camera fly-to animation using requestAnimationFrame, no external deps */
export class CameraAnimator {
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private animId: number | null = null;

  constructor(camera: THREE.PerspectiveCamera, controls: OrbitControls) {
    this.camera = camera;
    this.controls = controls;
  }

  flyTo({ position, target, up, duration = 800, easing = "smooth" }: AnimOptions): Promise<void> {
    return new Promise((resolve) => {
      if (this.animId !== null) cancelAnimationFrame(this.animId);

      const startPos = this.camera.position.clone();
      const startTarget = this.controls.target.clone();
      const startUp = this.camera.up.clone();
      const endUp = up ? up.clone().normalize() : null;
      const ease = EASINGS[easing] ?? EASINGS.smooth;
      const startTime = performance.now();

      const animate = (now: number) => {
        const t = Math.min((now - startTime) / duration, 1);
        const e = ease(t);

        this.camera.position.lerpVectors(startPos, position, e);
        this.controls.target.lerpVectors(startTarget, target, e);
        // Interpolate the up vector too, so a restored view never tilts when a
        // preset (top/front/…) had changed the camera up since it was saved.
        if (endUp) this.camera.up.copy(startUp).lerp(endUp, e).normalize();
        this.controls.update();

        if (t < 1) {
          this.animId = requestAnimationFrame(animate);
        } else {
          if (endUp) this.camera.up.copy(endUp);
          this.controls.update();
          this.animId = null;
          resolve();
        }
      };

      this.animId = requestAnimationFrame(animate);
    });
  }

  /** Fly to a camera marker position (offset behind the camera by `offset` units) */
  flyToCamera(
    camPos: THREE.Vector3 | [number, number, number],
    yawDeg = 0,
    offset = 5,
    duration = 800
  ): Promise<void> {
    const pos = Array.isArray(camPos)
      ? new THREE.Vector3(camPos[0], camPos[1], camPos[2])
      : camPos;
    const yaw = (yawDeg * Math.PI) / 180;
    const viewerPos = new THREE.Vector3(
      pos.x - Math.sin(yaw) * offset,
      pos.y - Math.cos(yaw) * offset,
      pos.z + 2
    );
    return this.flyTo({ position: viewerPos, target: pos, duration });
  }

  cancel() {
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }
}
