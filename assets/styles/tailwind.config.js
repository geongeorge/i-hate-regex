const { colors } = require("tailwindcss/defaultTheme");

module.exports = {
  theme: {
    fontFamily: {
      // compatible with @nuxtjs/color-mode
      darkSelector: ".dark-mode",
      sans: ["'Source Sans'", "-apple-system", "BlinkMacSystemFont"]
    },
    extend: {
      colors: {
        primary: colors.red["600"],
        secondary: colors.green["600"],
        gray: {
          ...colors.gray,
          default: colors.gray["200"]
        },
        dark: {
          default: colors.gray["700"],
          muted: colors.gray["500"]
        }
      }
    }
  },
  variants: {
    backgroundColor: [
      "dark",
      "dark-hover",
      "dark-group-hover",
      "dark-even",
      "dark-odd"
    ],
    textColor: ["group-hover", "hover", "dark", "dark-hover", "dark-active"],
    borderColor: ["dark", "dark-focus", "dark-focus-within"],
    opacity: ["group-hover", "hover"],
    border: ["hover"],
    width: ["responsive"]
  },
  purge: ["./src/**/*.html", "./src/**/*.vue", "./src/**/*.jsx"],
  plugins: [require("tailwindcss-dark-mode")()]
};
