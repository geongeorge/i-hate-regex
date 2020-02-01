import purgecss from '@fullhuman/postcss-purgecss'
export default {
  mode: 'universal',
  server: {
    port: 3600, // default: 3000
    host: '0.0.0.0' // default: localhost
  },
  /*
  ** Headers of the page
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href:"https://fonts.googleapis.com/css?family=Fira+Sans:400,600&display=swap"}
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '~/plugins/vue-fuse',
    '~/plugins/vue-awesome',
    { src: '~/plugins/regex-colorize', mode: 'client' },
    // { src: '~plugins/ga.js', mode: 'client' } //google analytics
  ],
  /*
  ** Nuxt.js dev-modules
  */
  devModules: [
    // Doc: https://github.com/nuxt-community/nuxt-tailwindcss
    '@nuxtjs/tailwindcss',
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/tailwindcss',
    ['@nuxtjs/google-analytics', {
      id: 'UA-153865454-1'
    }],
    ["@nuxtjs/toast"]
  ],
  toast: {
    position: "bottom-center",
    duration: 3000,
    theme: "bubble",
    keepOnHover: true
  },
  /*
  ** Build configuration
  */
  build: {
    transpile: [
      /^vue-awesome/,
      'regex-colorize'
    ],
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
    }
  },

  // purgeCSS: {
  //   // whitelist: ['lg:w-1/5', 'lg:w-4/5', 'hidden', 'lg:block'],
  //   paths: ['layouts-g/**/*.vue']
  // },
  postcss: {
    plugins: [
      purgecss({
        content: ['./pages/**/*.vue', './layouts/**/*.vue', './layouts-g/**/*.vue', './components/**/*.vue'],
        whitelist: ['html', 'body'],
      })
    ]
  }
}
