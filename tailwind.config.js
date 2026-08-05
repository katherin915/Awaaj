/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // kept so existing pages that reference these still work
        awaaj: {
          primary: '#FF6B35',
          secondary: '#004E89',
          accent: '#F7931E',
          success: '#10B981',
          danger: '#EF4444',
          warning: '#F59E0B',
          dark: '#1A1F2E',
          light: '#F8FAFC',
          muted: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


