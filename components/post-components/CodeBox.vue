<template>
  <div class="my-1 p-4 text-1xl rounded bg-gray-200">
    <no-ssr>
      <code class="w-full regex">
        <slot></slot>
      </code>
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
