import * as THREE from "three";

/**
 * World units covered by one CSS pixel at `position` — what a gizmo multiplies
 * its pixel size by to keep that size on screen at any distance, the way
 * TransformControls sizes its own arrows.
 */
export function worldPerPixel(
  camera: THREE.Camera,
  position: THREE.Vector3,
  heightPx: number,
): number {
  const h = Math.max(heightPx, 1);
  if ((camera as THREE.OrthographicCamera).isOrthographicCamera) {
    const ortho = camera as THREE.OrthographicCamera;
    return (ortho.top - ortho.bottom) / ortho.zoom / h;
  }
  const persp = camera as THREE.PerspectiveCamera;
  const dist = position.distanceTo(camera.getWorldPosition(new THREE.Vector3()));
  return (2 * Math.tan(THREE.MathUtils.degToRad(persp.fov) / 2) * dist) / persp.zoom / h;
}

/**
 * Run `fit` right before the renderer recomputes `group`'s world matrices,
 * every frame — so a pixel-sized gizmo follows camera moves without a hook
 * into the render loop.
 */
export function fitEachFrame(group: THREE.Object3D, fit: () => void): void {
  const update = group.updateMatrixWorld.bind(group);
  group.updateMatrixWorld = (force?: boolean) => {
    if (group.visible) fit();
    update(force);
  };
}
