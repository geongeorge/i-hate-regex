<template>
<div>
<div class='embed-container'>
      <iframe src="#" :height="height" ref='regviz' frameborder="0"></iframe>
</div>
</div>
</template>

<script>
export default {
    props: {
        height: {default: 400},
        regex: {default: / /},
        embedRoot: {default: 'https://embed.ihateregex.io/make/'},
    },
    data() {
        return {
        }
    },
    mounted() {
      this.reload()
    // handeled in watch
    },
    methods: {
        reload() {
            var embedUrl = this.embedRoot+encodeURI(btoa(this.regex.source));
             this.$refs.regviz.src = embedUrl;
        }
    },
    watch:{
        
        regex() {
            this.reload()
        }
    }
};
</script>

<style>
.embed-container {
  position: relative;
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