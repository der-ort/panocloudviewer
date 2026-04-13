import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/** Quartic ease-out (same curve as original Potree TWEEN animation) */
function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

interface AnimOptions {
  position: THREE.Vector3;
  target: THREE.Vector3;
  duration?: number; // ms, default 800
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

  flyTo({ position, target, duration = 800 }: AnimOptions): Promise<void> {
    return new Promise((resolve) => {
      if (this.animId !== null) cancelAnimationFrame(this.animId);

      const startPos = this.camera.position.clone();
      const startTarget = this.controls.target.clone();
      const startTime = performance.now();

      const animate = (now: number) => {
        const t = Math.min((now - startTime) / duration, 1);
        const e = easeOutQuart(t);

        this.camera.position.lerpVectors(startPos, position, e);
        this.controls.target.lerpVectors(startTarget, target, e);
        this.controls.update();

        if (t < 1) {
          this.animId = requestAnimationFrame(animate);
        } else {
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
