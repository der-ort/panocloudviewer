import * as THREE from "three";
import { ViewHelper } from "three/examples/jsm/helpers/ViewHelper.js";
import type { SceneManager } from "./scene-manager";

/**
 * World-orientation gizmo in the bottom-left corner, using three.js's native
 * {@link ViewHelper} for the visual (the colored X/Y/Z axis balls + labels).
 *
 * Two deliberate deviations from `ViewHelper`'s out-of-the-box behavior, both
 * because this scene is **Z-up** with a single OrbitControls:
 *  1. **Placement** — `ViewHelper.render()` hard-codes the bottom-RIGHT corner,
 *     where our minimap lives. We render its gizmo Object3D ourselves into a
 *     bottom-LEFT viewport instead (reusing ViewHelper's own ortho camera params).
 *  2. **Click-to-snap** — `ViewHelper.handleClick()` animates the camera with
 *     hard-coded **Y-up** target orientations and never touches OrbitControls,
 *     which would fight our Z-up setup (the "axis shift" bug). So we do our own
 *     hit-test against the gizmo axes and fly via the callback, which the
 *     Viewport wires to the Z-up-safe CameraAnimator.
 */
export class AxisGizmo {
  readonly sm: SceneManager;
  private helper: ViewHelper;
  /** Matches ViewHelper's internal ortho camera (frustum + position). */
  private orthoCamera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0, 4);
  private raycaster = new THREE.Raycaster();
  private _savedVp = new THREE.Vector4();
  private _mouse = new THREE.Vector2();

  private readonly dim = 128;   // gizmo size in px (ViewHelper's own dim)
  private readonly margin = 8;  // inset from the corner

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
  }

  /**
   * Render the gizmo into the bottom-left corner. Call from a post-render
   * callback (after the main scene renders). Mirrors ViewHelper.render() but
   * with our own viewport rect.
   */
  render(): void {
    const renderer = this.sm.renderer;
    const el = renderer.domElement;
    if (el.clientWidth === 0 || el.clientHeight === 0) return;

    // Mirror the main camera's orientation (ViewHelper.render does this).
    this.helper.quaternion.copy(this.sm.camera.quaternion).invert();
    this.helper.updateMatrixWorld();

    renderer.getViewport(this._savedVp);
    const savedScissorTest = renderer.getScissorTest();

    renderer.setScissorTest(false);
    renderer.clearDepth();
    renderer.setViewport(this.margin, this.margin, this.dim, this.dim);
    renderer.render(this.helper, this.orthoCamera);

    renderer.setViewport(this._savedVp.x, this._savedVp.y, this._savedVp.z, this._savedVp.w);
    renderer.setScissorTest(savedScissorTest);
  }

  /**
   * Hit-test a click against the gizmo axes. Returns true (and invokes
   * `onAxisSelect`) if an axis was clicked; false to let the click fall through
   * to normal viewport handling.
   */
  handleClick(clientX: number, clientY: number): boolean {
    if (!this.onAxisSelect) return false;
    const el = this.sm.renderer.domElement;
    const rect = el.getBoundingClientRect();

    const px = clientX - rect.left;
    const pyFromBottom = rect.height - (clientY - rect.top);
    // Outside the bottom-left gizmo square → not ours.
    if (px < this.margin || px > this.margin + this.dim) return false;
    if (pyFromBottom < this.margin || pyFromBottom > this.margin + this.dim) return false;

    this._mouse.set(
      ((px - this.margin) / this.dim) * 2 - 1,
      ((pyFromBottom - this.margin) / this.dim) * 2 - 1,
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
