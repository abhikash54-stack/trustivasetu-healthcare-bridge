/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        trustiva: {
          navy: "#07111f",
          panel: "#0f172a",
          lime: "#bef264",
          "lime-dark": "#a3e635",
          muted: "#94a3b8",
        },
      },
    },
  },
  plugins: [],
}