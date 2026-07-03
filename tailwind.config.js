/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./context/**/*.{js,jsx,ts,tsx}",
    "./store/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palet brand
        peach: {
          100: "#FAF1E3", // chip / permukaan lembut
          200: "#F7DFBD", // background luar
          300: "#F0CD9F", // bentuk dekoratif
        },
        cream: {
          50: "#FDFAF4",
          100: "#FAF1E3",
          200: "#F0E4D0",
          300: "#E5D2B4",
        },
        cocoa: {
          700: "#3B3230",
          800: "#251F1F", // warna gelap brand
          900: "#1A1616",
        },
        accent: {
          400: "#F2A257",
          500: "#EE8A2F", // oranye brand
          600: "#D97921",
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 24px rgba(37, 31, 31, 0.07)",
        panel: "0 16px 48px rgba(37, 31, 31, 0.14)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
