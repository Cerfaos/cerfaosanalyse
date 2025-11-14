/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-white': '#FDF6E3',
        'bg-gray-50': '#F4F0D9',
        'bg-gray-100': '#EFE9D1',
        'bg-gray-200': '#E6E2CC',
        'bg-gray-300': '#D8D3C5',

        'text-dark': '#3C4841',
        'text-body': '#4F5B58',
        'text-secondary': '#5C6A72',
        'text-muted': '#708089',
        'text-tertiary': '#8B958A',
        'text-disabled': '#A3B0A0',

        'border-base': '#E6E2CC',
        'border-strong': '#CCC7B0',

        brand: '#A7C080',
        'brand-dark': '#859C64',
        accent: '#7FBBB3',
        'accent-500': '#7FBBB3',
        'accent-700': '#557875',
        success: '#83C092',
        warning: '#DBBC7F',
        error: '#E67E80',
        cta: '#E69875',

        info: '#7FBBB3',
        'info-dark': '#33504C',
        'info-light': '#E5F3EF',
        'success-light': '#E2F2E7',
        'warning-light': '#FBF1DD',
        'error-light': '#FCE5E4',

        'dark-bg': '#0F1410',
        'dark-surface': '#1C231E',
        'dark-border': '#2D3830',
        'dark-text': '#EAE1CC',
        'dark-text-secondary': '#B5A893',
        'dark-text-contrast': '#F8F3E6',

        'forest-green': '#A7C080',
        'forest-blue': '#7FBBB3',
        'forest-orange': '#E69875',
        'forest-purple': '#D699B6',
      },
      spacing: {
        '0.5': '0.125rem',   // 2px
        '1': '0.25rem',      // 4px
        '1.5': '0.375rem',   // 6px
        '2': '0.5rem',       // 8px
        '2.5': '0.625rem',   // 10px
        '3': '0.75rem',      // 12px
        '3.5': '0.875rem',   // 14px
        '4': '1rem',         // 16px
        '5': '1.25rem',      // 20px
        '6': '1.5rem',       // 24px
        '7': '1.75rem',      // 28px
        '8': '2rem',         // 32px
        '9': '2.25rem',      // 36px
        '10': '2.5rem',      // 40px
        '12': '3rem',        // 48px
        '14': '3.5rem',      // 56px
        '16': '4rem',        // 64px
        '20': '5rem',        // 80px
      },
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',     // 4px - shadcn/ui style
        'DEFAULT': '0.5rem', // 8px
        'md': '0.5rem',      // 8px
        'lg': '0.75rem',     // 12px - shadcn/ui cards
        'xl': '1rem',        // 16px
        '2xl': '1.25rem',    // 20px
        '3xl': '1.5rem',     // 24px
        'full': '9999px',
      },
      boxShadow: {
        'soft': '0 10px 30px rgba(15, 23, 42, 0.08)',
        'strong': '0 25px 60px rgba(15, 23, 42, 0.16)',
        'card': '0 8px 20px rgba(15, 23, 42, 0.08)',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Bricolage Grotesque', 'Space Grotesk', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
