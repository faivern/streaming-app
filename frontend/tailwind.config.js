/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        '3xl': '1920px',
        '4xl': '2560px',
      },
      maxWidth: {
        'screen-4xl': '2560px',
      },
    },
  },
  plugins: [
    require("tailwind-scrollbar"),
  ],
};
