import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Amplivanta brand
        violet: {
          DEFAULT: "#6D3BF5",
          primary: "#6D3BF5",
          hover: "#5B2FE0",
          dark: "#5B2FE0",
          ink: "#5B2FE0",
        },
        purple: { DEFAULT: "#9B3BF5" },
        pink: { DEFAULT: "#E8398F", brand: "#E8398F" },
        orange: { brand: "#F5731A" },
        // Neutrals
        ink: {
          DEFAULT: "#14121f",
          soft: "#4a4756",
          muted: "#767287",
        },
        line: "#e9e7f0",
        // Dark surfaces
        navy: {
          DEFAULT: "#0d0b18",
          dark: "#0d0b18",
          darker: "#0d0b18",
          border: "#26233a",
        },
        // Legacy aliases mapped onto the new palette
        lime: {
          primary: "#6D3BF5",
          hover: "#5B2FE0",
          dark: "#5B2FE0",
          ink: "#5B2FE0",
        },
        green: {
          dark: "#0d0b18",
          darker: "#0d0b18",
          border: "#26233a",
          accent: "#1FAE6A",
        },
        brand: {
          black: "#14121f",
          gray: "#4a4756",
          muted: "#767287",
          surface: "#f8f7fb",
          border: "#e9e7f0",
        },
      },
      backgroundImage: {
        "grad-brand": "linear-gradient(90deg, #6D3BF5, #E8398F, #F5731A)",
        "grad-brand-2": "linear-gradient(135deg, #6D3BF5, #C43BE0, #F5731A)",
        "grad-cta": "linear-gradient(100deg, #5B2FE0 0%, #9B2FD8 45%, #E04A2F 100%)",
      },
      fontFamily: {
        display: ["var(--font-manrope)", "Manrope", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        card: "0 16px 34px -18px rgba(30,20,60,.25)",
        "card-lg": "0 30px 70px -25px rgba(30,20,60,.28), 0 4px 18px -6px rgba(30,20,60,.08)",
        violet: "0 8px 20px -6px rgba(109,59,245,.55)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-in": "slideIn 0.5s ease-out forwards",
        marquee: "marquee 25s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
