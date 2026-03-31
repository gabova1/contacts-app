import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "SF Pro Text", "Helvetica Neue", "sans-serif"],
      },
      colors: {
        ios: {
          blue: "#007AFF",
          red: "#FF3B30",
          green: "#34C759",
          gray: "#8E8E93",
          "light-gray": "#F2F2F7",
          separator: "#C6C6C8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
