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
      <div class="hidden md:block mr-3">
        <p
          class="text-right text-sm opacity-50 hover:opacity-100 hover:underline"
        >
          <a href="#" @click.prevent="copyEmbedCode()">
            <v-icon name="copy" class="" scale="1"></v-icon>
            embed code
          </a>
        </p>
      </div>
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
    return {
      embedUrl: ""
    };
  },
  computed: {
    embedString() {
      return `<iframe
        src="${this.embedUrl}"
        height="${this.height}"
        style="width:100%"
        frameborder="0"
      />
      `;
    }
  },
  watch: {
    regex() {
      this.reload();
    }
  },
  mounted() {
    this.reload();
    // handeled in watch
  },
  methods: {
    reload() {
      this.embedUrl = this.embedRoot + this.hashEncodeUrl(this.regex.source);
      // console.log("source", this.regex.source, embedUrl)
      this.$refs.regviz.src = this.embedUrl;
    },
    // to encode base64 for url
    //https://gist.github.com/geongeorge/c30e9b1e3e7590b8a22464c879ad9a04
    hashEncodeUrl(str) {
      const mystr = str.replace(/\\/g, "\\\\"); // escaping \
      return btoa(encodeURIComponent(mystr))
        .replace(/\+/g, "-")
        .replace(/\//g, "_") //  /..
        .replace(/\\/g, ",") //  \
        .replace(/\=+$/, ""); // eslint-disable-line
    },

    copyEmbedCode() {
      const tempInput = document.createElement("input");
      tempInput.style = "position: absolute; left: -1000px; top: -1000px";
      tempInput.value = this.embedString;
      document.body.appendChild(tempInput);
      tempInput.select();

      try {
        document.execCommand("copy");
        this.$toast.success("Copied");
      } catch (err) {
        this.$toast.error("Oops, unable to copy");
      }

      document.body.removeChild(tempInput);

      /* unselect the range */
      // regexToCopy.setAttribute('type', 'hidden')
      window.getSelection().removeAllRanges();
    }
  }
};
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
