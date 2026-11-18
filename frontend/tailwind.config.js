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
          // Primary Forest & Sage Palette
          primary: '#244B38',        // Rich Forest Green
          primaryHover: '#1B392B',   // Deep Forest Hover
          forest: '#244B38',
          forestDark: '#172E22',
          forestLight: '#EBF3EE',
          sage: '#3D7357',           // Medium Sage
          sageLight: '#F0F5F2',
          sageBorder: '#C8DAD0',

          // Warm Ivory & Canvas Backgrounds
          bg: '#F8F8F5',             // Warm Off-White / Ivory Canvas
          bgMuted: '#F2F2EE',        // Soft Neutral Surface
          card: '#FFFFFF',           // Crisp White Card Surface
          ivory: '#FAF9F5',

          // Deep Charcoal Text System
          charcoal: '#191C1A',       // Primary Headlines / High Contrast
          navy: '#191C1A',           // Legacy compatibility mapped to charcoal
          dark: '#141614',
          slate: '#373C38',          // Refined Body Text
          muted: '#6A726A',          // Muted Secondary Text
          mutedLight: '#949E94',

          // Subtle Neutral Borders
          border: '#E2E5DF',         // Standard subtle border
          borderLight: '#ECEEE9',
          borderDark: '#D5D8D1',

          // Score & Status Accents (Editorial, Non-Neon)
          accent: '#2D5A43',
          accentLight: '#EBF2EE',
          violet: '#2D5A43',         // Mapped to forest to eliminate purple
          success: '#244B38',
          successBg: '#EBF3EE',
          warning: '#B45309',        // Warm Amber
          warningBg: '#FEF7EE',
          danger: '#BE3A34',         // Warm Terracotta / Red
          dangerBg: '#FDF0EF',
          info: '#2B546B',           // Deep Slate Teal
          infoBg: '#EEF5F8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft-xs': '0 1px 2px 0 rgba(25, 28, 26, 0.04)',
        'soft': '0 1px 3px 0 rgba(25, 28, 26, 0.04), 0 4px 12px 0 rgba(25, 28, 26, 0.03)',
        'soft-md': '0 2px 4px 0 rgba(25, 28, 26, 0.04), 0 8px 24px 0 rgba(25, 28, 26, 0.06)',
        'soft-lg': '0 4px 8px 0 rgba(25, 28, 26, 0.04), 0 16px 36px 0 rgba(25, 28, 26, 0.08)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
