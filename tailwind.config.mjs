// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
    extend: {
      // Set font family
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
				dosis: ['Dosis', 'Verdana', 'sans-serif'],
        raleway: ['Raleway', 'Verdana', 'sans-serif'],
      },
      colors: {
        primary: colors.lime,
        secondary: colors.orange,
      },
    },
  },
  // Add plugins
  plugins: [
		require("@tailwindcss/typography"), 
		require("@tailwindcss/forms"),
	],
}
