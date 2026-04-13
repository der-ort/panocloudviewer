import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import fs from "fs";
import url from "url";

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: "#0a0a0a",
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Load the static Next.js export from apps/web/out/
  const indexPath = path.join(__dirname, "../../web/out/index.html");
  win.loadURL(url.pathToFileURL(indexPath).toString());

  if (process.env.NODE_ENV === "development") {
    win.webContents.openDevTools();
  }

  win.on("closed", () => { win = null; });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (!win) createWindow();
});

// ─── IPC: File system bridge ────────────────────────────────────────────────

ipcMain.handle("fs:readFile", async (_event, filePath: string) => {
  return fs.promises.readFile(filePath);
});

ipcMain.handle("fs:readJson", async (_event, filePath: string) => {
  const text = await fs.promises.readFile(filePath, "utf-8");
  return JSON.parse(text);
});

ipcMain.handle("fs:listDir", async (_event, dirPath: string) => {
  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
  return entries.map(e => ({ name: e.name, isDir: e.isDirectory() }));
});

ipcMain.handle("fs:exists", async (_event, filePath: string) => {
  try { await fs.promises.access(filePath); return true; }
  catch { return false; }
});

ipcMain.handle("dialog:openFolder", async () => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  return result.canceled ? null : result.filePaths[0];
});
