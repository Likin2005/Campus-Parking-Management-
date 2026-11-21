/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF4FF',
          100: '#D9E6FF',
          200: '#BCD2FE',
          300: '#8EB3FC',
          400: '#598CF9',
          500: '#2A63F0',
          600: '#1B47D9',
          700: '#12306B', // Navy primary specified
          800: '#0E2350',
          900: '#091634',
        },
        surface: {
          page: '#F6F8FB',
          card: '#FFFFFF',
          muted: '#F1F5F9',
          darkPage: '#0B1120',
          darkCard: '#151F32',
          darkMuted: '#1E293B',
        },
        accent: {
          teal: '#0D9488',
          tealLight: '#14B8A6',
          green: '#16A34A',
          greenLight: '#22C55E',
        },
        slot: {
          availBg: '#ECFDF5',
          availText: '#065F46',
          availBorder: '#10B981',
          occBg: '#F1F5F9',
          occText: '#475569',
          occBorder: '#94A3B8',
          resBg: '#FFFBEB',
          resText: '#92400E',
          resBorder: '#F59E0B',
          disBg: '#FEF2F2',
          disText: '#991B1B',
          disBorder: '#EF4444',
          selBg: '#EEF4FF',
          selText: '#12306B',
          selBorder: '#1B47D9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'card': '1rem',
        'subtle': '0.75rem',
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(18, 48, 107, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'elevated': '0 10px 25px -3px rgba(18, 48, 107, 0.08), 0 4px 6px -2px rgba(18, 48, 107, 0.03)',
        'modal': '0 20px 40px -15px rgba(18, 48, 107, 0.25)',
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      }
    },
  },
  plugins: [],
}
