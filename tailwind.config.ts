import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: '#FF4D00',
          light: '#FF7A40',
          dark: '#CC3D00',
        },
        blue: {
          DEFAULT: '#00A3FF',
          light: '#40C2FF',
          dark: '#007ACC',
        },
        surface: {
          DEFAULT: '#0A0A0A', // Deep black/gray
          highlight: '#141414',
          card: '#1A1A1A',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        primary: '#FF4D00', // Alias for orange
        secondary: '#00A3FF', // Alias for blue
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'sans-serif'],
        display: ['var(--font-playfair)', 'serif'],
        body: ['var(--font-outfit)', 'sans-serif'],
      },
      fontSize: {
        '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
        '8xl': ['5.5rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #FF4D00 0deg, #A78BFA 180deg, #FF4D00 360deg)',
      }
    },
  },
  plugins: [],
}
export default config
