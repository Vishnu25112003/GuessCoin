/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cyber: {
          darker: "#0a0e27",
          dark: "#1a1f3a",
          bg: "#0f1629",
          text: "#e0e7ff",
          primary: "#00d9ff",
          secondary: "#8b5cf6",
          accent: "#ff006e",
          success: "#00ff88",
          warning: "#ffb800",
          error: "#ff0055",
          muted: "#94a3b8",
        },
      },
      fontFamily: {
        display: ["'Orbitron'", "monospace"],
        mono: ["'Roboto Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
