<template>
  <div class="my-1 p-4 text-2xl rounded bg-gray-200">
    <no-ssr>
      <div 
      class="w-full regex"
      >
        {{regex}}
      </div>
      </no-ssr>
  </div>
</template>

<script>
// import VueRegexColorize from "~/plugins/vue-regex-colorize";
import "regex-colorize/themes/sweetest.css";
// 
var rgx;
if (process.client) {
  require('regex-colorize');
  rgx =new window.RegexColorize.default();
  // var RegexColorize = new window.RegexColorize.default();
  // console.log(RegexColorize);
  // RegexColorize.addStyleSheet();
}
export default {
  props:{
    regex: RegExp
  },
  components: {
    // VueRegexColorize
  },
  mounted() {
    setTimeout(()=>{
      rgx.colorizeAll();
    },500)
    
  }
};
</script>

<style>
</style>
