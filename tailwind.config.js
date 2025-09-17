/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Corrugated Box Manufacturing Theme Colors
        primary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98', // Main brand color - cardboard brown-blue
          600: '#556b82',
          700: '#495a6b',
          800: '#3d4852',
          900: '#2d3748',
          950: '#1a202c',
        },
        cardboard: {
          50: '#faf8f3',
          100: '#f4f0e6',
          200: '#e8dcc4',
          300: '#d4bc8a',
          400: '#c5a572', // Classic cardboard color
          500: '#b8975a',
          600: '#a18650',
          700: '#8a7347',
          800: '#70603f',
          900: '#5c5037',
          950: '#322b1e',
        },
        corrugated: {
          50: '#fdf8f0',
          100: '#faf0e0',
          200: '#f4ddbf',
          300: '#ebc394',
          400: '#dfa366', // Corrugated orange-brown
          500: '#d48843',
          600: '#c67339',
          700: '#a45d31',
          800: '#854c2e',
          900: '#6d4028',
          950: '#3b2014',
        },
        manufacturing: {
          50: '#f7f8f9',
          100: '#ebeef2',
          200: '#d3dae2',
          300: '#afbcc9',
          400: '#8597ab',
          500: '#667890', // Industrial blue-gray
          600: '#546176',
          700: '#475161',
          800: '#3e4651',
          900: '#373d45',
          950: '#24282d',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        }
      },
      backgroundImage: {
        'corrugated-pattern': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23f4ddbf\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M30 30L15 15v30h30V15L30 30z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
        'box-pattern': "linear-gradient(45deg, #f4ddbf 25%, transparent 25%), linear-gradient(-45deg, #f4ddbf 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f4ddbf 75%), linear-gradient(-45deg, transparent 75%, #f4ddbf 75%)",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        }
      },
      boxShadow: {
        'soft': '0 2px 15px 0 rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 25px 0 rgba(0, 0, 0, 0.1)',
        'hard': '0 10px 40px 0 rgba(0, 0, 0, 0.1)',
        'corrugated': '0 4px 6px -1px rgba(196, 165, 114, 0.1), 0 2px 4px -1px rgba(196, 165, 114, 0.06)',
      }
    },
  },
  plugins: [],
}