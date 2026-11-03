/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Dòng này rất quan trọng để Tailwind tìm thấy file App.jsx
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}