import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f7f0',
          100: '#dceedc',
          200: '#bbdebb',
          300: '#8dc78d',
          400: '#5caa5c',
          500: '#3a8c3a',
          600: '#2a7030',
          700: '#1e5522',  // verde escuro principal
          800: '#1a4a1e',
          900: '#163d19',
          950: '#0a200d',
        },
        leaf: {
          50:  '#f5fbf0',
          100: '#e8f5de',
          200: '#ceebbf',
          300: '#a8d994',
          400: '#7dc264',
          500: '#5aa843',  // verde claro
          600: '#438832',
          700: '#356b27',
          800: '#2d5622',
          900: '#27471e',
        },
        earth: {
          50:  '#fdf8f0',
          100: '#faeede',
          200: '#f3d9b8',
          300: '#eabe8a',
          400: '#de9f59',
          500: '#d4853a',  // tom terra
          600: '#c06a2d',
          700: '#a05027',
          800: '#824026',
          900: '#6b3522',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      keyframes: {
        'fade-in': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'slide-in-left': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        'zoom-in': { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'zoom-in': 'zoom-in 0.3s ease-out',
      },
      boxShadow: {
        'card': '0 2px 16px 0 rgba(30,85,34,0.08)',
        'card-hover': '0 8px 32px 0 rgba(30,85,34,0.16)',
      },
    },
  },
  plugins: [],
}

export default config
