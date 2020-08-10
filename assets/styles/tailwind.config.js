module.exports = {
  theme: {
    fontFamily: {
      sans: ["'Source Sans'", "-apple-system", "BlinkMacSystemFont"]
    }
  },
  variants: {
    textColor: ["group-hover", "hover"],
    opacity: ["group-hover", "hover"],
    border: ["hover"],
    width: ["responsive"]
  },
  purge: ["./src/**/*.html", "./src/**/*.vue", "./src/**/*.jsx"]
};
