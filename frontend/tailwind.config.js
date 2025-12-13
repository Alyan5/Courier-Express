/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e40af",      // Deep blue
        secondary: "#0f172a",    // Very dark slate
        accent: "#d97706",       // Warm amber/orange
        success: "#059669",      // Teal green
        warning: "#dc2626",      // Strong red
        danger: "#dc2626",       // Strong red
        dark: "#111827",         // Near black
        light: "#f9fafb",        // Off white
      }
    },
  },
  plugins: [],
}
