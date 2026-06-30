import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PanoCloud Viewer",
  description: "Point cloud and panorama viewer",
};

// `viewportFit: "cover"` lets the viewer's chrome read `env(safe-area-inset-*)`
// so floating UI stays clear of the notch / OS status bar / home indicator on
// mobile. `100dvh` (set on the page wrapper) handles the browser address bar.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ height: "100dvh" }}>
      <body style={{ height: "100dvh" }}>{children}</body>
    </html>
  );
}
