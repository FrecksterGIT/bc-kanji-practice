/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media',
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 20s linear infinite',
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'sans-serif'],
      },
      // Add any custom colors using the new color syntax
      colors: {
        // You can use direct color values
        primary: '#4a90e2',
        secondary: '#3b82f6',
      },
    },
  },
  // Configure form styles to match Tailwind 4 defaults
  forms: {
    // Enable default form styles
    strategy: 'class',
  },
  plugins: [],
}
