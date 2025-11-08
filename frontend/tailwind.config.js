/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'bg-white': '#FFFFFF',
        'bg-gray-50': '#F9FAFB',
        'bg-gray-100': '#F3F4F6',
        'bg-gray-200': '#E5E7EB',

        // Text
        'text-dark': '#1F2937',
        'text-body': '#374151',
        'text-secondary': '#6B7280',
        'text-tertiary': '#9CA3AF',
        'text-disabled': '#D1D5DB',

        // Borders
        'border-light': '#F3F4F6',
        'border-base': '#E5E7EB',
        'border-medium': '#D1D5DB',
        'border-dark': '#9CA3AF',

        // Accent cycliste (bleu)
        'accent-50': '#EFF6FF',
        'accent-100': '#DBEAFE',
        'accent-500': '#3B82F6',
        'accent-600': '#2563EB',
        'accent-700': '#1D4ED8',

        // Semantic colors
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'info': '#3B82F6',
      },
      spacing: {
        '8': '8px',
        '16': '16px',
        '24': '24px',
        '32': '32px',
        '48': '48px',
        '64': '64px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'button': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'button-hover': '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
