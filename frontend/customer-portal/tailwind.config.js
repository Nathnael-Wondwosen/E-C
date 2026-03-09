/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "0.75rem",
        sm: "1rem",
        lg: "1.25rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
      },
      screens: {
        "2xl": "1720px",
      },
    },
    extend: {},
  },
  plugins: [],
}
