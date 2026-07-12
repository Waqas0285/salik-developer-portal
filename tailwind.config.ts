import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        salik: {
          50: "#eefaf3",
          100: "#d6f2e2",
          200: "#aee4c8",
          300: "#7bd0a9",
          400: "#48b386",
          500: "#26966b",
          600: "#167a56",
          700: "#126147",
          800: "#114d3a",
          900: "#0f4030",
          950: "#062319",
        },
        charcoal: {
          50: "#f4f5f7",
          100: "#e5e7ec",
          200: "#c9ccd6",
          300: "#a3a8b8",
          400: "#7b8194",
          500: "#5f6579",
          600: "#4a4f61",
          700: "#3d4150",
          800: "#2d2f3a",
          900: "#1e1f27",
          950: "#131319",
        },
        info: { DEFAULT: "#2563eb", light: "#dbeafe" },
        warn: { DEFAULT: "#d97706", light: "#fef3c7" },
        danger: { DEFAULT: "#dc2626", light: "#fee2e2" },
        success: { DEFAULT: "#16a34a", light: "#dcfce7" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15,23,42,0.04), 0 1px 3px 0 rgba(15,23,42,0.06)",
        popover: "0 8px 24px -4px rgba(15,23,42,0.18)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      backgroundImage: {
        "salik-hero":
          "radial-gradient(circle at 15% 20%, rgba(38,150,107,0.25), transparent 40%), radial-gradient(circle at 85% 0%, rgba(38,150,107,0.15), transparent 45%), linear-gradient(135deg, #0f4030 0%, #131319 60%)",
        "road-lines":
          "repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 40px, transparent 40px, transparent 80px)",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
        "slide-up": "slide-up 0.18s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
