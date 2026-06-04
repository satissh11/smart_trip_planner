/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      colors: {
        primary: "#06b6d4",
        secondary: "#3b82f6",
        darkBg: "#0f172a",
        lightGlass: "rgba(255,255,255,0.08)"
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },

      boxShadow: {
        glow: "0 0 20px rgba(6,182,212,0.6)",
      },

      backdropBlur: {
        xs: "2px",
      },

      animation: {
        fadeIn: "fadeIn 0.8s ease-in-out",
        float: "float 3s ease-in-out infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },

    },
  },
  plugins: [],
}