import type { PointCloudSource } from "../types";

/** Abstraction over file loading - allows S3, Electron, and local HTTP sources */
export interface FileSourceAdapter {
  /** Resolve a relative path to a full URL or absolute path */
  resolveUrl(relativePath: string): string;
  /** Fetch JSON data */
  fetchJson<T>(relativePath: string): Promise<T>;
  /** Fetch binary data */
  fetchBinary(relativePath: string): Promise<ArrayBuffer>;
  /** Optional: fetch with custom headers (used by potree-core RequestManager) */
  fetchWithHeaders?(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  /** Optional: list directories (used for multi-project scanning) */
  listDirectories?(path: string): Promise<string[]>;
}

/** HTTP/S3 adapter - works in browser and Electron via fetch */
export class S3SourceAdapter implements FileSourceAdapter {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(baseUrl: string, headers: Record<string, string> = {}) {
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
    this.headers = headers;
  }

  resolveUrl(relativePath: string): string {
    return this.baseUrl + relativePath;
  }

  async fetchJson<T>(relativePath: string): Promise<T> {
    const res = await fetch(this.resolveUrl(relativePath), { headers: this.headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${relativePath}`);
    return res.json() as Promise<T>;
  }

  async fetchBinary(relativePath: string): Promise<ArrayBuffer> {
    const res = await fetch(this.resolveUrl(relativePath), { headers: this.headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${relativePath}`);
    return res.arrayBuffer();
  }

  fetchWithHeaders(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    // Only attach the configured (potentially auth) headers to requests that
    // target OUR base URL — never leak credentials to foreign origins that a
    // crafted metadata/cameras file might point at.
    const url =
      typeof input === "string" ? input :
      input instanceof URL ? input.href :
      input.url;
    const ours = url.startsWith(this.baseUrl);
    const mergedHeaders = ours
      ? { ...this.headers, ...(init?.headers as Record<string, string>) }
      : init?.headers;
    return fetch(input, { ...init, headers: mergedHeaders });
  }
}

/** Electron IPC adapter - uses window.electronFS bridge exposed by preload */
export class ElectronSourceAdapter implements FileSourceAdapter {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath.replace(/\\/g, "/");
    if (!this.basePath.endsWith("/")) this.basePath += "/";
  }

  resolveUrl(relativePath: string): string {
    return "file:///" + this.basePath + relativePath;
  }

  async fetchJson<T>(relativePath: string): Promise<T> {
    const abs = this.basePath + relativePath;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    if (!win.electronFS) throw new Error("electronFS not available - is preload loaded?");
    const data: string = await win.electronFS.readFile(abs, "utf-8");
    return JSON.parse(data) as T;
  }

  async fetchBinary(relativePath: string): Promise<ArrayBuffer> {
    const abs = this.basePath + relativePath;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    if (!win.electronFS) throw new Error("electronFS not available");
    const buffer: ArrayBuffer = await win.electronFS.readFileBinary(abs);
    return buffer;
  }

  async listDirectories(path: string): Promise<string[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    if (!win.electronFS) return [];
    return win.electronFS.readdir(this.basePath + path);
  }
}

/** Create the appropriate adapter from a source config */
export function createAdapter(source: PointCloudSource): FileSourceAdapter {
  switch (source.type) {
    case "s3":
      return new S3SourceAdapter(source.baseUrl, source.headers);
    case "electron":
      return new ElectronSourceAdapter(source.basePath);
    case "local":
      // Local = serve via Next.js public folder or dev server
      return new S3SourceAdapter(source.basePath);
  }
}
