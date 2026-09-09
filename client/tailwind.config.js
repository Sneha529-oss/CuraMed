/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf9',
          100: '#ccfbef',
          200: '#99f6e0',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        navy: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        risk: {
          low: '#059669',
          'low-bg': '#ecfdf5',
          'low-border': '#a7f3d0',
          med: '#d97706',
          'med-bg': '#fffbeb',
          'med-border': '#fde68a',
          high: '#e11d48',
          'high-bg': '#fff1f2',
          'high-border': '#fecdd3',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(15, 23, 42, 0.05), 0 1px 4px -1px rgba(15, 23, 42, 0.03)',
        'card': '0 4px 20px -4px rgba(15, 23, 42, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
        'elevated': '0 12px 30px -6px rgba(15, 23, 42, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
