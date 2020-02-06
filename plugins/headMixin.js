import Vue from "vue"

export default ({ route }) => {
  Vue.mixin({
    head() {
      return {
        meta: [
          {
            hid: `og:url`,
            property: "og:url",
            content: "https://ihateregex.io" + route.fullPath
          },
          {
            hid: "og:image",
            name: "og:image",
            content: require("~/static/images/ihateregex.png")
          },
          { hid: "og:type", name: "og:type", content: "website" },
          {
            hid: "og:site_name",
            name: "og:site_name",
            content: "i Hate Regex"
          },
          {
            hid: "keywords",
            name: "keywords",
            content: "regex, regular expressions, cheatsheet, regex tool"
          }
        ]
      }
    }
  })
}
