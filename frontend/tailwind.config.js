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
          navy: '#0F172A',
          dark: '#1E293B',
          primary: '#4F46E5', // Indigo
          primaryHover: '#4338CA',
          violet: '#6366F1',
          accent: '#0284C7', // Soft Blue
          accentLight: '#E0F2FE',
          bg: '#F8FAFC',
          card: '#FFFFFF',
          slate: '#334155',
          muted: '#64748B',
          border: '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

