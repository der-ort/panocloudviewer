import { contextBridge, ipcRenderer } from "electron";

/**
 * Secure IPC bridge exposed as `window.electronFS`.
 * Matches the interface expected by ElectronSourceAdapter.
 */
contextBridge.exposeInMainWorld("electronFS", {
  readFile: (filePath: string): Promise<ArrayBuffer> =>
    ipcRenderer.invoke("fs:readFile", filePath),

  readJson: (filePath: string): Promise<unknown> =>
    ipcRenderer.invoke("fs:readJson", filePath),

  listDir: (dirPath: string): Promise<{ name: string; isDir: boolean }[]> =>
    ipcRenderer.invoke("fs:listDir", dirPath),

  exists: (filePath: string): Promise<boolean> =>
    ipcRenderer.invoke("fs:exists", filePath),

  openFolder: (): Promise<string | null> =>
    ipcRenderer.invoke("dialog:openFolder"),
});
