import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@der-ort/pano-cloud-viewer/dist/*.js",
  ],
  theme: { extend: {} },
  plugins: [],
};

export default config;
