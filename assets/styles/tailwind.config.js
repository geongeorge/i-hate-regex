module.exports = {
  theme: {
    fontFamily: {
      // compatible with @nuxtjs/color-mode
      darkSelector: ".dark-mode",
      sans: ["'Source Sans'", "-apple-system", "BlinkMacSystemFont"]
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
