import regexArray from "./static/regex/data.json";

const port = process.env.port || 3600;
const host = "localhost";

let myUrl =
  process.env.NODE_ENV !== "production"
    ? "http://" + host + ":" + port
    : "https://ihateregex.io";

if (process.env.site_type === "staging") {
  myUrl = "https://dev.ihateregex.io";
}

const robotsObj =
  process.env.site_type === "staging"
    ? {
        UserAgent: "*",
        Disallow: "/"
      }
    : {};

export default {
  mode: "universal",
  server: {
    port, // default: 3000
    host // default: localhost
  },
  /*
   ** Headers of the page
   */
  head: {
    title: process.env.npm_package_name || "",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: process.env.npm_package_description || ""
      }
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: "#fff" },
  /*
   ** Global CSS
   */
  css: ["~/assets/styles/main.scss"],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    "~/plugins/vue-fuse",
    "~/plugins/vue-awesome",
    { src: "~/plugins/regex-colorize", mode: "client" },
    "~/plugins/headMixin.js"
    // { src: '~plugins/ga.js', mode: 'client' } //google analytics
  ],
  /*
   ** Nuxt.js buildModules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/nuxt-tailwindcss
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    [
      "@nuxtjs/google-analytics",
      {
        id: "UA-153865454-1"
      }
    ]
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    "@nuxtjs/axios",
    "@nuxtjs/markdownit",
    "@nuxtjs/toast",
    "@nuxtjs/sitemap",
    "@nuxtjs/robots"
  ],
  tailwindcss: {
    cssPath: "~/assets/styles/tailwind.scss",
    configPath: "./assets/styles/tailwind.config.js",
    exposeConfig: false,
    config: {}
  },
  axios: {
    baseURL: myUrl
  },
  markdownit: {
    injected: true
  },
  robots: robotsObj,
  toast: {
    position: "bottom-center",
    duration: 3000,
    theme: "outline",
    keepOnHover: true
  },
  /*
   ** Build configuration
   */
  build: {
    transpile: [/^vue-awesome/, "regex-colorize"],
    /*
     ** You can extend webpack config here
     */

    extend(config, ctx) {
      // Run ESLint on save
      // if (ctx.isDev && ctx.isClient) {
      //   config.module.rules.push({
      //     enforce: "pre",
      //     test: /\.(js|vue)$/,
      //     loader: "eslint-loader",
      //     exclude: /(node_modules)/
      //   })
      // }

      //this is for webpack - require('fs') to work
      config.node = { fs: "empty" };
    }
  },

  postcss: {
    plugins: []
  },

  // sitemap begin
  sitemap: {
    path: "/sitemap.xml",
    hostname: myUrl,
    sitemaps: [
      {
        path: "/sitemap-main.xml",
        routes: ["/playground", "/cheatsheet", "/expr"]
      },
      {
        path: "/sitemap-regex.xml",
        routes: regexArray.map(el => "expr/" + el.id)
      }
    ]
  }
  // sitemap end
};
