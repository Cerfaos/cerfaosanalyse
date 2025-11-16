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
        'bg-white': '#FFFFFF',
        'bg-gray-50': '#F7F7F5',
        'bg-gray-100': '#EEEEEC',
        'bg-gray-200': '#E0E0DE',
        'bg-gray-300': '#D0D0CE',

        'text-dark': '#1A1F1C',
        'text-body': '#2D3330',
        'text-secondary': '#3D4840',
        'text-muted': '#5A635C',
        'text-tertiary': '#6B746D',
        'text-disabled': '#9CA39E',

        'border-base': '#3D4D40',
        'border-strong': '#2D3A30',

        brand: '#059669',
        'brand-dark': '#047857',
        accent: '#991B1B',
        'accent-500': '#991B1B',
        'accent-700': '#7F1D1D',
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
        cta: '#991B1B',

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

        // Couleurs bois/terreuses
        'wood-light': '#D4C4A8',
        'wood-medium': '#B8A080',
        'wood-dark': '#8B7355',
        'earth-warm': '#C9B99A',
        'earth-cool': '#A8B094',
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
