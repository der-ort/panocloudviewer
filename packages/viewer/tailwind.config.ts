import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border:      "hsl(var(--border))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        muted:       { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        card:        { DEFAULT: "hsl(var(--card))",  foreground: "hsl(var(--card-foreground))" },
        popover:     { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        primary:     { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        brand:       "hsl(var(--brand))",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm:  "calc(var(--radius) - 4px)",
        md:  "var(--radius)",
        lg:  "calc(var(--radius) + 4px)",
        xl:  "calc(var(--radius) + 8px)",
      },
    },
  },
  plugins: [],
};

export default config;
