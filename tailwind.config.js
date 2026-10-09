/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14212b",
        muted: "#4a5d6a",
        line: "#c5d0d6",
        accent: "#1f6f78",
        soft: "#d7ecee",
        canvas: "#f3f7f6",
        hist: "#6b5b4f",
        neu: "#0d5c63",
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
        display: ["Fraunces", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
