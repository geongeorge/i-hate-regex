import purgecss from "@fullhuman/postcss-purgecss"
const port = 3600;
const host = "localhost";
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
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      {
        rel: "stylesheet",
        href:
          "https://fonts.googleapis.com/css?family=Fira+Sans:400,600&display=swap"
      }
    ]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: "#fff" },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    "~/plugins/vue-fuse",
    "~/plugins/vue-awesome",
    { src: "~/plugins/regex-colorize", mode: "client" },
    '~/plugins/headMixin.js'
    // { src: '~plugins/ga.js', mode: 'client' } //google analytics
  ],
  /*
   ** Nuxt.js dev-modules
   */
  devModules: [
    // Doc: https://github.com/nuxt-community/nuxt-tailwindcss
    "@nuxtjs/tailwindcss"
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    '@nuxtjs/axios',
    "@nuxtjs/markdownit",
    "@nuxtjs/tailwindcss",
    [
      "@nuxtjs/google-analytics",
      {
        id: "UA-153865454-1"
      }
    ],
    ["@nuxtjs/toast"]
  ],
  axios: {
    baseURL : process.env.NODE_ENV !== 'production'? 'http://'+host+':'+port:"https://ihateregex.io"
  },
  markdownit: {
    injected: true
  },
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
      config.node = { fs: 'empty' }
    }
  },

  // purgeCSS: {
  //   // whitelist: ['lg:w-1/5', 'lg:w-4/5', 'hidden', 'lg:block'],
  //   paths: ['layouts-g/**/*.vue']
  // },
  postcss: {
    plugins: [
      purgecss({
        content: [
          "./pages/**/*.vue",
          "./layouts/**/*.vue",
          "./layouts-g/**/*.vue",
          "./components/**/*.vue"
        ],
        whitelist: ["html", "body"]
      })
    ]
  }
}
