import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        primary: "#0070f3",
        secondary: "#f81ce5",
        accent: "#f81ce5",
        muted: "rgb(var(--muted) / <alpha-value>)",
        error: "#ff0000",
        success: "#00ff00",
        warning: "#ffcc00",
      },
    },
  },
  plugins: [],
};

export default config;
