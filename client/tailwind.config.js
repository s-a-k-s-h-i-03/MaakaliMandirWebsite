/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        temple: {
          maroon: "#7A1E1E",
          gold: "#E2B95B",
          cream: "#FAF1DE",
          soft: "#FFF8ED",
          card: "#FFFFFF",
          text: "#2F241C",
          muted: "#7A6654"
        }
      },
      boxShadow: {
        temple: "0 10px 30px rgba(122, 30, 30, 0.09)",
        glow: "0 12px 40px rgba(226, 185, 91, 0.28)"
      },
      fontFamily: {
        display: ["Playfair Display", "Noto Sans Devanagari", "serif"],
        body: ["Inter", "Noto Sans Devanagari", "sans-serif"],
        hindi: ["Noto Sans Devanagari", "sans-serif"]
      }
    }
  },
  plugins: []
};
