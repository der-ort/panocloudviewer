import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PanoCloud Viewer",
  description: "Point cloud and panorama viewer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ height: "100%" }}>
      <body style={{ height: "100%" }}>{children}</body>
    </html>
  );
}
