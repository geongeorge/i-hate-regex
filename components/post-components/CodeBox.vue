<template>
<section>
  <div 
  class="flex my-1 p-4 text-2xl rounded bg-gray-200 transition"
  :class="{'bg-red-200': regexError}"
  >
    <no-ssr>
      <div
      class="w-5/6 focus:outline-none regex"
      contenteditable="true"
      @paste.prevent="onPaste"
      @keyup="regexChanged"
      ref="codebox"
      >{{regex.source}}</div>
      </no-ssr>
      <div 
      class="w-1/6 text-right text-gray-400 hover:text-green-400"
      >
      <a 
      href="#"
      @click.prevent="toggleFlagSelect"
      >/{{myflag}}</a>
      </div>
  </div>
  <no-ssr>
  <FlagSelector :modelShow="flagSelectorShow" @closeModal="toggleFlagSelect"
  @selected="flagsChange"
  ></FlagSelector>
  </no-ssr>
  </section>
  </template>

<script>
// import VueRegexColorize from "~/plugins/vue-regex-colorize";
import "regex-colorize/themes/sweetest.css";
import FlagSelector from '~/components/post-components/utils/FlagSelector'
import pastePlainText from '~/mixins/pastePlainText.js';
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

  mixins:[pastePlainText],
  components: {
    FlagSelector
  },
  data() {
    return {
      myRegex: null,
      changeTimer: null,
      regexError: false,
      myflag: "",
      flagSelectorShow : false
    }
  },
  props:{
    regex: RegExp,
    flag: String
  },
  mounted() {
    // setting editable flag to prop inherited value
    this.myflag = this.flag; 
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
         reg = new RegExp(codebox.innerText,this.myflag);
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
      if(isValid) {
        this.$emit('regexChanged',{
          regex: reg,
          flag: this.myflag
        })
      }
    },
    toggleFlagSelect() {
      this.flagSelectorShow = !this.flagSelectorShow
    },
    flagsChange(newFlagArray) {
      this.myflag = newFlagArray.join('');
      this.regexChanged()
    }
  }
};
</script>

<style>
.transition { transition: all .5s ease; }
</style>
