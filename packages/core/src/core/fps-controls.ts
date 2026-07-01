import * as THREE from "three";

/**
 * FPS-style fly controls for free 3D navigation.
 *
 * - Right-click drag (or pointer lock) to look around (yaw + pitch)
 * - WASD moves in the camera's look direction (horizontal plane + forward)
 * - Q descends, E ascends (world Y… or Z depending on up axis)
 * - No camera roll — up vector stays fixed
 * - Shift for double speed
 */
export class FpsControls {
  camera: THREE.Camera;
  domElement: HTMLElement;
  movementSpeed = 10;
  lookSpeed = 0.002;
  enabled = true;

  private _euler = new THREE.Euler(0, 0, 0, "YXZ");
  private _keys = new Set<string>();
  private _dragging = false;
  private _prevX = 0;
  private _prevY = 0;
  private _disposed = false;

  // Bound listeners for cleanup
  private _onKeyDown: (e: KeyboardEvent) => void;
  private _onKeyUp: (e: KeyboardEvent) => void;
  private _onMouseDown: (e: MouseEvent) => void;
  private _onMouseMove: (e: MouseEvent) => void;
  private _onMouseUp: (e: MouseEvent) => void;
  private _onContextMenu: (e: Event) => void;

  constructor(camera: THREE.Camera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Extract initial yaw/pitch from camera quaternion
    this._euler.setFromQuaternion(camera.quaternion, "YXZ");

    this._onKeyDown = (e) => this._handleKeyDown(e);
    this._onKeyUp = (e) => this._handleKeyUp(e);
    this._onMouseDown = (e) => this._handleMouseDown(e);
    this._onMouseMove = (e) => this._handleMouseMove(e);
    this._onMouseUp = () => this._handleMouseUp();
    this._onContextMenu = (e) => e.preventDefault();

    document.addEventListener("keydown", this._onKeyDown);
    document.addEventListener("keyup", this._onKeyUp);
    domElement.addEventListener("mousedown", this._onMouseDown);
    document.addEventListener("mousemove", this._onMouseMove);
    document.addEventListener("mouseup", this._onMouseUp);
    domElement.addEventListener("contextmenu", this._onContextMenu);
  }

  /** Sync euler from current camera orientation (call when switching to fly mode) */
  syncFromCamera(): void {
    this._euler.setFromQuaternion(this.camera.quaternion, "YXZ");
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    if (!this.enabled) return;
    this._keys.add(e.code);
  }

  private _handleKeyUp(e: KeyboardEvent): void {
    this._keys.delete(e.code);
  }

  private _handleMouseDown(e: MouseEvent): void {
    if (!this.enabled) return;
    // Right-click or middle-click to look
    if (e.button === 2 || e.button === 1) {
      this._dragging = true;
      this._prevX = e.clientX;
      this._prevY = e.clientY;
    }
  }

  private _handleMouseMove(e: MouseEvent): void {
    if (!this.enabled || !this._dragging) return;
    const dx = e.clientX - this._prevX;
    const dy = e.clientY - this._prevY;
    this._prevX = e.clientX;
    this._prevY = e.clientY;

    // Yaw (rotate around world up) and pitch (tilt up/down)
    this._euler.y -= dx * this.lookSpeed;
    this._euler.x -= dy * this.lookSpeed;
    // Clamp pitch to avoid flipping
    this._euler.x = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this._euler.x));

    this.camera.quaternion.setFromEuler(this._euler);
  }

  private _handleMouseUp(): void {
    this._dragging = false;
  }

  // Reused scratch vectors so update() (called up to 60×/s) allocates nothing.
  private _forward = new THREE.Vector3();
  private _right = new THREE.Vector3();
  private _move = new THREE.Vector3();
  /** World up — Z-up scene, never mutated. */
  private static readonly UP = new THREE.Vector3(0, 0, 1);

  /**
   * Update camera position based on held keys.
   * @param delta Time in seconds since last frame
   */
  update(delta: number): void {
    if (!this.enabled) return;

    const speed = this.movementSpeed * delta * (this._keys.has("ShiftLeft") || this._keys.has("ShiftRight") ? 2 : 1);

    // Forward (camera-local -Z) and right (camera-local +X) in world space.
    const forward = this._forward.set(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const right = this._right.set(1, 0, 0).applyQuaternion(this.camera.quaternion);
    const up = FpsControls.UP;

    const move = this._move.set(0, 0, 0);

    if (this._keys.has("KeyW")) move.add(forward);
    if (this._keys.has("KeyS")) move.sub(forward);
    if (this._keys.has("KeyA")) move.sub(right);
    if (this._keys.has("KeyD")) move.add(right);
    if (this._keys.has("KeyE")) move.add(up);
    if (this._keys.has("KeyQ")) move.sub(up);

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(speed);
      this.camera.position.add(move);
    }
  }

  dispose(): void {
    if (this._disposed) return;
    this._disposed = true;
    document.removeEventListener("keydown", this._onKeyDown);
    document.removeEventListener("keyup", this._onKeyUp);
    this.domElement.removeEventListener("mousedown", this._onMouseDown);
    document.removeEventListener("mousemove", this._onMouseMove);
    document.removeEventListener("mouseup", this._onMouseUp);
    this.domElement.removeEventListener("contextmenu", this._onContextMenu);
  }
}
