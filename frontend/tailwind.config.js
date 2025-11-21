/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-white": "#FFFFFF",
        "bg-gray-50": "#F8F9FA",
        "bg-gray-100": "#F1F3F5",
        "bg-gray-200": "#E9ECEF",
        "bg-gray-300": "#DEE2E6",

        "text-dark": "#252A34", // Dark Grey instead of pure black for "pleasant" look
        "text-body": "#393E46",
        "text-secondary": "#495057",
        "text-muted": "#868E96",
        "text-tertiary": "#ADB5BD",
        "text-disabled": "#CED4DA",

        "border-base": "#252A34",
        "border-strong": "#000000",

        brand: "#FF2E63", // Vibrant Pink
        "brand-dark": "#D92050",
        accent: "#08D9D6", // Cyan
        "accent-500": "#08D9D6",
        "accent-700": "#06B5B2",

        success: "#00CC66",
        warning: "#FFDE7D", // Sunny Yellow
        error: "#FF2E63", // Using Brand Pink for error/danger as it fits
        cta: "#252A34",

        info: "#08D9D6",
        "info-dark": "#06B5B2",
        "info-light": "#E0FFFF",
        "success-light": "#E6FFF0",
        "warning-light": "#FFFBE6",
        "error-light": "#FFE6E6",

        "dark-bg": "#252A34", // Dark Blue-Grey
        "dark-surface": "#2E3542",
        "dark-border": "#EAEAEA",
        "dark-text": "#EAEAEA",
        "dark-text-secondary": "#A0A0A0",
        "dark-text-contrast": "#FFFFFF",
      },
      spacing: {
        0.5: "0.125rem",
        1: "0.25rem",
        1.5: "0.375rem",
        2: "0.5rem",
        2.5: "0.625rem",
        3: "0.75rem",
        3.5: "0.875rem",
        4: "1rem",
        5: "1.25rem",
        6: "1.5rem",
        7: "1.75rem",
        8: "2rem",
        9: "2.25rem",
        10: "2.5rem",
        12: "3rem",
        14: "3.5rem",
        16: "4rem",
        20: "5rem",
      },
      borderRadius: {
        none: "0",
        sm: "8px",
        DEFAULT: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "40px",
        "3xl": "48px",
        full: "9999px",
      },
      boxShadow: {
        sm: "0 2px 8px -2px rgba(0, 0, 0, 0.05)",
        DEFAULT: "0 4px 12px -2px rgba(0, 0, 0, 0.08)",
        md: "0 8px 24px -4px rgba(0, 0, 0, 0.12)",
        lg: "0 12px 32px -6px rgba(0, 0, 0, 0.15)",
        xl: "0 20px 48px -8px rgba(0, 0, 0, 0.2)",
        "inner-light": "inset 0 2px 4px 0 rgba(255, 255, 255, 0.2)",
        "inner-dark": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)",
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
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
