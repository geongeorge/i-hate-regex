<template>
  <div 
  class="my-1 p-4 text-2xl rounded bg-gray-200 transition"
  :class="{'bg-red-200': regexError}"
  >
    <no-ssr>
      <div 
      class="w-full focus:outline-none regex"
      contenteditable="true"
      @keyup="regexChanged"
      ref="codebox"
      >{{regex.source}}</div>
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
  data() {
    return {
      myRegex: null,
      changeTimer: null,
      regexError: false,
    }
  },
  props:{
    regex: RegExp
  },
  components: {
    // VueRegexColorize
  },
  mounted() {
    // let reg = new RegExp(this.regex);
    // this.myRegex = reg
    // setTimeout(()=>{
    //   rgx.colorizeAll();
    // },500)
    setTimeout(()=>{
      this.regexChanged()
    },500)
    
  },
  methods: {
    regexChanged() {
      let isValid = true;
       let reg;
      let codebox = this.$refs.codebox
      try {
         reg = new RegExp(codebox.innerText);
         this.regexError = false
      } catch(e) {
        isValid = false;
        this.regexError = true
      }
      if (this.changeTimer) {
        clearTimeout(this.changeTimer);
      }
      this.changeTimer = setTimeout(() => {
        rgx.colorizeAll();
      }, 3000);
      console.log(isValid,reg)
      if(isValid) {
        this.$emit('regexChanged',reg)
      }
    }
  }
};
</script>

<style>
.transition { transition: all .5s ease; }
</style>
