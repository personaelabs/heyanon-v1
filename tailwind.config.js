/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    colors: {
      heyanonred: "#d12b38",
      heyanonyellow: "#f2c43e",
      heyanonblack: "#2a2c2e",
    },
  },
  plugins: [],
};
