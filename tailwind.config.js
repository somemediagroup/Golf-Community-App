/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        'black': "#1F1E1F", // Black from color scheme
        'white': "#FBFCFB", // White from color scheme
        'muted-green': "#448460", // Muted Green from color scheme

        // UI component colors mapped to the brand colors
        border: "#1F1E1F40", // Black with opacity
        input: "#1F1E1F40", // Black with opacity
        ring: "#1F1E1F", // Black
        background: "#FBFCFB", // White
        foreground: "#1F1E1F", // Black
        primary: {
          DEFAULT: "#448460", // Muted Green
          foreground: "#FBFCFB", // White
        },
        secondary: {
          DEFAULT: "#1F1E1F", // Black
          foreground: "#FBFCFB", // White
        },
        destructive: {
          DEFAULT: "#991b1b", // Keep red for destructive actions
          foreground: "#FBFCFB", // White
        },
        muted: {
          DEFAULT: "#f3f4f6", // Light gray for muted backgrounds
          foreground: "#6b7280", // Gray for muted text
        },
        accent: {
          DEFAULT: "#448460", // Muted Green
          foreground: "#FBFCFB", // White
        },
        popover: {
          DEFAULT: "#FBFCFB", // White
          foreground: "#1F1E1F", // Black
        },
        card: {
          DEFAULT: "#FBFCFB", // White
          foreground: "#1F1E1F", // Black
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} 