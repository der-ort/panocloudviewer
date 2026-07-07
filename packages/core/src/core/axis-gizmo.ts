import * as THREE from "three";
import { ViewHelper } from "three/examples/jsm/helpers/ViewHelper.js";
import type { SceneManager } from "./scene-manager";

/**
 * World-orientation gizmo in the bottom-right corner, using three.js's native
 * {@link ViewHelper} for the visual (the colored X/Y/Z axis balls + labels).
 *
 * Two deviations from `ViewHelper`'s out-of-the-box behavior:
 *  1. **Placement** — we render its gizmo Object3D ourselves so the corner can be
 *     shifted left by `rightOffset` px (the Viewport feeds the open sidebar's
 *     width each frame, so the gizmo slides out from under it and back).
 *  2. **Click-to-snap** — `ViewHelper.handleClick()` animates with hard-coded
 *     **Y-up** targets and never touches OrbitControls, which would fight our
 *     Z-up setup (the "axis shift" bug). So we hit-test the axes ourselves and
 *     fly via the callback, which the Viewport wires to the Z-up-safe CameraAnimator.
 */
export class AxisGizmo {
  readonly sm: SceneManager;
  private helper: ViewHelper;
  /** Replica of ViewHelper's internal ortho camera (frustum + position) for render + hit-testing. */
  private orthoCamera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0, 4);
  private raycaster = new THREE.Raycaster();
  private _mouse = new THREE.Vector2();
  private _savedVp = new THREE.Vector4();

  private readonly dim = 128; // gizmo size in px (ViewHelper's own dim)

  /** Shift the gizmo this many px left of the bottom-right corner (0 = corner). */
  rightOffset = 0;

  /**
   * Called when the user clicks an axis. `dir` is the unit direction from the
   * orbit target toward the desired camera position (already nudged off the
   * ±Z pole so the Z-up orbit stays stable). The Viewport flies the camera there.
   */
  onAxisSelect: ((dir: THREE.Vector3) => void) | null = null;

  constructor(sm: SceneManager) {
    this.sm = sm;
    this.helper = new ViewHelper(sm.camera, sm.renderer.domElement);
    this.helper.setLabels("X", "Y", "Z");
    this.orthoCamera.position.set(0, 0, 2);
    // Static camera; matrixWorld would otherwise never update (we render the
    // helper through this replica, not via ViewHelper's own render).
    this.orthoCamera.updateMatrixWorld();
  }

  /**
   * Render the gizmo into the bottom-right corner (shifted left by `rightOffset`).
   * Call from a post-render callback after the main scene renders. Mirrors
   * ViewHelper.render() but with our own viewport rect; scissor is already off
   * (the loop resets it before post-render callbacks).
   */
  render(): void {
    const renderer = this.sm.renderer;
    const el = renderer.domElement;
    if (el.clientWidth === 0 || el.clientHeight === 0) return;

    this.helper.quaternion.copy(this.sm.camera.quaternion).invert();
    this.helper.updateMatrixWorld();

    const x = el.clientWidth - this.dim - this.rightOffset;
    renderer.getViewport(this._savedVp);
    renderer.clearDepth();
    renderer.setViewport(x, 0, this.dim, this.dim);
    renderer.render(this.helper, this.orthoCamera);
    renderer.setViewport(this._savedVp.x, this._savedVp.y, this._savedVp.z, this._savedVp.w);
  }

  /**
   * Hit-test a click against the gizmo axes (bottom-right dim×dim square, shifted
   * left by `rightOffset`). Returns true (and invokes `onAxisSelect`) if an axis
   * was clicked; false to let the click fall through to normal viewport handling.
   */
  handleClick(clientX: number, clientY: number): boolean {
    if (!this.onAxisSelect) return false;
    const el = this.sm.renderer.domElement;
    const rect = el.getBoundingClientRect();
    const dim = this.dim;

    const offsetX = rect.right - this.rightOffset - dim;
    const offsetY = rect.bottom - dim;
    if (clientX < offsetX || clientX > offsetX + dim) return false;
    if (clientY < offsetY || clientY > offsetY + dim) return false;

    this._mouse.set(
      ((clientX - offsetX) / dim) * 2 - 1,
      -((clientY - offsetY) / dim) * 2 + 1,
    );
    this.raycaster.setFromCamera(this._mouse, this.orthoCamera);
    const hits = this.raycaster.intersectObjects(this.helper.children, false);
    const hit = hits.find(h => typeof h.object.userData.type === "string");
    if (!hit) return false;

    const dir = AXIS_DIR[hit.object.userData.type as AxisType];
    if (!dir) return false;
    this.onAxisSelect(dir.clone());
    return true;
  }

  dispose(): void {
    this.helper.dispose();
  }
}

type AxisType = "posX" | "negX" | "posY" | "negY" | "posZ" | "negZ";

/**
 * Camera-offset direction per clicked axis. Z-up scene: top/bottom aim slightly
 * off the ±Z pole (matching the OrbitControls polar clamp) so the orbit never
 * hits the gimbal singularity — same trick as the view-preset buttons.
 */
const AXIS_DIR: Record<AxisType, THREE.Vector3> = {
  posX: new THREE.Vector3(1, 0, 0),
  negX: new THREE.Vector3(-1, 0, 0),
  posY: new THREE.Vector3(0, 1, 0),
  negY: new THREE.Vector3(0, -1, 0),
  posZ: new THREE.Vector3(0, -0.035, 1).normalize(),
  negZ: new THREE.Vector3(0, -0.035, -1).normalize(),
};
