import type { ClipBoxEntry, ClipMode } from "./clip-manager";

/** Serialisable viewer scene / perspective */
export interface ViewerScene {
  id: string;
  name: string;
  createdAt: string; // ISO 8601
  camera: {
    position: [number, number, number];
    target: [number, number, number];
    /** Camera up vector. Optional for backward compat with older saved scenes. */
    up?: [number, number, number];
  };
  clipBoxes: Array<{
    name: string;
    min: [number, number, number];
    max: [number, number, number];
    mode: ClipMode;
    visible: boolean;
  }>;
  colorMode: string;
  pointSize: number;
  pointBudget: number;
}

const MAX_SCENES = 50;

let _nextId = 1;
function genSceneId(): string {
  return `scene_${Date.now()}_${_nextId++}`;
}

/**
 * Persists viewer scenes (perspectives) in localStorage.
 * Key is derived from the source URL so each project keeps its own list.
 */
export class PresentationManager {
  private storageKey: string;
  private scenes: ViewerScene[] = [];

  onChange?: (scenes: ViewerScene[]) => void;

  constructor(sourceKey: string) {
    this.storageKey = `pcv_scenes_${sourceKey}`;
    this.load();
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) this.scenes = JSON.parse(raw);
    } catch {
      this.scenes = [];
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.scenes));
    } catch {
      // localStorage may be full — silently ignore
    }
    this.onChange?.(this.getScenes());
  }

  getScenes(): ViewerScene[] {
    return [...this.scenes];
  }

  addScene(scene: Omit<ViewerScene, "id" | "createdAt">): ViewerScene {
    const entry: ViewerScene = {
      ...scene,
      id: genSceneId(),
      createdAt: new Date().toISOString(),
    };
    this.scenes.unshift(entry);
    if (this.scenes.length > MAX_SCENES) this.scenes.length = MAX_SCENES;
    this.persist();
    return entry;
  }

  removeScene(id: string): void {
    this.scenes = this.scenes.filter(s => s.id !== id);
    this.persist();
  }

  renameScene(id: string, name: string): void {
    const scene = this.scenes.find(s => s.id === id);
    if (scene) {
      scene.name = name;
      this.persist();
    }
  }

  /** Export all scenes as a JSON string (for sharing / backup) */
  exportJSON(): string {
    return JSON.stringify(this.scenes, null, 2);
  }

  /** Import scenes from JSON string, merging with existing */
  importJSON(json: string): number {
    try {
      const imported: ViewerScene[] = JSON.parse(json);
      if (!Array.isArray(imported)) return 0;
      const existingIds = new Set(this.scenes.map(s => s.id));
      let count = 0;
      for (const scene of imported) {
        if (!scene.id || !scene.name || !scene.camera) continue;
        if (existingIds.has(scene.id)) {
          scene.id = genSceneId(); // avoid duplicates
        }
        this.scenes.push(scene);
        count++;
      }
      if (this.scenes.length > MAX_SCENES) this.scenes.length = MAX_SCENES;
      this.persist();
      return count;
    } catch {
      return 0;
    }
  }

  clear(): void {
    this.scenes = [];
    this.persist();
  }
}

/** Helper: capture current viewer state into a scene object */
export function captureScene(
  name: string,
  cameraPos: { x: number; y: number; z: number },
  cameraTarget: { x: number; y: number; z: number },
  clipBoxes: ClipBoxEntry[],
  colorMode: string,
  pointSize: number,
  pointBudget: number,
  cameraUp: { x: number; y: number; z: number } = { x: 0, y: 0, z: 1 },
): Omit<ViewerScene, "id" | "createdAt"> {
  return {
    name,
    camera: {
      position: [cameraPos.x, cameraPos.y, cameraPos.z],
      target: [cameraTarget.x, cameraTarget.y, cameraTarget.z],
      up: [cameraUp.x, cameraUp.y, cameraUp.z],
    },
    clipBoxes: clipBoxes.map(b => ({
      name: b.name,
      min: [b.box.min.x, b.box.min.y, b.box.min.z],
      max: [b.box.max.x, b.box.max.y, b.box.max.z],
      mode: b.mode,
      visible: b.visible,
    })),
    colorMode,
    pointSize,
    pointBudget,
  };
}
