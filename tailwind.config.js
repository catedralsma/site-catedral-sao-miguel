/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      maxWidth: {
        'screen': '100vw',
        'full': '100%',
      },
      width: {
        'screen': '100vw',
      },
      screens: {
        'xs': '475px',
      },
      colors: {
        'cathedral-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#002c53',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      height: {
        'screen-safe': ['100vh', '100dvh'],
      },
      minHeight: {
        'screen-safe': ['100vh', '100dvh'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            lineHeight: '1.75',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
