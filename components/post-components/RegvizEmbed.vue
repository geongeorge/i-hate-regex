<template>
  <div>
    <div class="embed-container">
      <iframe
        ref="regviz"
        class=""
        src="https://embed.ihateregex.io/"
        :height="height"
        frameborder="0"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    height: { default: 400 },
    regex: { default: / / },
    embedRoot: { default: "https://embed.ihateregex.io/make/" }
    // embedRoot: {default: 'http://localhost:3300/make/'},
  },
  data() {
    return {}
  },
  watch: {
    regex() {
      this.reload()
    }
  },
  mounted() {
    this.reload()
    // handeled in watch
  },
  methods: {
    reload() {
      var embedUrl = this.embedRoot + this.hashEncodeUrl(this.regex.source)
      console.log("source", this.regex.source, embedUrl)
      this.$refs.regviz.src = embedUrl
    },
    // to encode base64 for url
    //https://gist.github.com/geongeorge/c30e9b1e3e7590b8a22464c879ad9a04
    hashEncodeUrl(str) {
      let mystr = str.replace(/\\/g, "\\\\") // escaping \
      return btoa(encodeURIComponent(mystr))
        .replace(/\+/g, "-")
        .replace(/\//g, "_") //  /..
        .replace(/\\/g, ",") //  \
        .replace(/\=+$/, "")
    }
  }
}
</script>

<style>
.embed-container {
  position: relative;
  z-index: 2;
  height: auto;
  overflow: hidden;
  max-width: 100%;
}
.embed-container iframe,
.embed-container object,
.embed-container embed {
  top: 0;
  left: 0;
  width: 100%;
}
</style>
