/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        temple: {
          maroon: "#8B0000",
          gold: "#FFD700",
          cream: "#FFF3D6",
          soft: "#FFF8E1",
          card: "#FFFFFF",
          text: "#1f2937",
          muted: "#6b7280"
        }
      },
      boxShadow: {
        temple: "0 10px 30px rgba(139, 0, 0, 0.08)",
        glow: "0 12px 40px rgba(255, 215, 0, 0.25)"
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
