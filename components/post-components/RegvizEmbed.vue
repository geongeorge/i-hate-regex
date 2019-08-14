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
        embedRoot: {default: 'http://localhost:3300/make/'},
    },
    data() {
        return {
            timer: null,
            initialLoad:true,
        }
    },
    mounted() {
    //   this.reload()
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
            //needed to ignore initial watch on init load
            if(this.initialLoad) {
                this.reload()
                this.initialLoad = false 
                return;
            }
            if(this.timer){
                clearTimeout(this.timer)
            }
          this.timer = setTimeout(()=>{
             this.reload()
            },1000)
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