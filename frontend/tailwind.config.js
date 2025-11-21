/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // CSS Variables System
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",

        // Chart Colors
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },

        // Organic Aliases (for backward compatibility)
        organic: {
          bg: "var(--background)",
          card: "var(--card)",
          gold: "var(--secondary)",
          green: "var(--primary)",
          text: "var(--foreground)",
          light: "#f5f5f5",
        },

        // Legacy colors (keeping for compatibility)
        "bg-white": "#FFFFFF",
        "bg-gray-50": "#F8F9FA",
        "bg-gray-100": "#F1F3F5",
        "bg-gray-200": "#E9ECEF",
        "bg-gray-300": "#DEE2E6",
        "text-dark": "#252A34",
        "text-body": "#393E46",
        "text-secondary": "#495057",
        "text-muted": "#868E96",
        "text-tertiary": "#ADB5BD",
        "text-disabled": "#CED4DA",
        "border-base": "#252A34",
        "border-strong": "#000000",

        // Status colors
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--destructive)",

        // Dark mode (legacy)
        "dark-bg": "#252A34",
        "dark-surface": "#2E3542",
        "dark-border": "#EAEAEA",
        "dark-text": "#EAEAEA",
        "dark-text-secondary": "#A0A0A0",
        "dark-text-contrast": "#FFFFFF",
      },
      borderRadius: {
        none: "0",
        sm: "calc(var(--radius) - 4px)",
        DEFAULT: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) * 1.5)",
        "3xl": "calc(var(--radius) * 2)",
        "4xl": "calc(var(--radius) * 2.5)",
        full: "9999px",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-md)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "0 20px 48px -8px oklch(0 0 0 / 0.25)",
        "inner-light": "inset 0 2px 4px 0 rgba(255, 255, 255, 0.2)",
        "inner-dark": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: [
          "Bricolage Grotesque",
          "Space Grotesk",
          "Inter",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
