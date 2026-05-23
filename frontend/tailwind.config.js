/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        peach: {
  50: "#FFF7F5",
  100: "#FDEAE5",
  200: "#F7C9BF",
  300: "#F1B2A7",
  400: "#EE8585",
  500: "#E56F6F",
},
      },
    },
  },
  plugins: [],
};