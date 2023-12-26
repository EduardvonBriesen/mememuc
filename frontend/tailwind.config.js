/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      serif: ['"Just Me Again Down Here"', "sans-serif"],
    },
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#118AB2",
          secondary: "#EF476F",
          accent: "#06D6A0",
          neutral: "#374151",
          "base-100": "#111827",
          info: "#118AB2",
          success: "#06D6A0",
          warning: "#FFD166",
          error: "#EF476F",
        },
      },
    ],
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
