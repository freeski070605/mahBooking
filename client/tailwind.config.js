import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        lg: "2rem",
        xl: "2.5rem",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        surface: {
          50: "#fffaf6",
          100: "#fdf1e7",
          200: "#f7dfcb",
          300: "#f2c7a5",
          400: "#eea574",
          500: "#e7792d",
          600: "#cb5f18",
          700: "#9f4715",
          800: "#7d3918",
          900: "#673117",
        },
        ink: {
          700: "#4c3a33",
          800: "#352824",
          900: "#251c19",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        luxe: "0 20px 60px rgba(96, 55, 19, 0.12)",
        panel: "0 14px 40px rgba(69, 42, 25, 0.08)",
        soft: "0 10px 24px rgba(73, 45, 28, 0.07)",
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        sans: ["'Manrope'", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(18px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.65s ease-out forwards",
        shimmer: "shimmer 1.8s infinite",
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top right, rgba(231, 121, 45, 0.22), transparent 35%), radial-gradient(circle at top left, rgba(242, 199, 165, 0.38), transparent 30%), linear-gradient(180deg, #fffaf7 0%, #f5eee7 42%, #fffaf7 100%)",
        "mesh-warm":
          "radial-gradient(circle at 0% 0%, rgba(231, 121, 45, 0.18), transparent 28%), radial-gradient(circle at 100% 0%, rgba(242, 199, 165, 0.35), transparent 23%), radial-gradient(circle at 50% 100%, rgba(246, 217, 194, 0.3), transparent 30%)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
