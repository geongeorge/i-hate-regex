<template>
  <div>
    <div class="flex w-full flex-row">
      <div class="text-sm float-right mr-2">
        <a
          href="#"
          class="text-gray-500 hover:underline"
          @click="toggleMatches"
        >{{ showText }}</a>
      </div>
    </div>
    <transition-expand>
    <div v-show="displayMatches">
      <div
        class="text-gray-600 text-lg p-3 rounded focus:outline-none bg-blue-100 mb-2 shadow-inner whitespace-pre"
        contenteditable="true"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        id="matchbox"
        @keyup="boxEdited"
        ref="matchbox"
        v-html="dataText"
      ></div>
      </div>
    </transition-expand>
  </div>
</template>

<script>
import TransitionExpand from './TransitionExpand'
export default {
    props: {
        regex : {default: "/(?:)/"},
        sampleText: {default: ["Lorem ipsum"]}
    },
  data() {
    return {
      displayMatches: false,
      dataText:"",
      queries: [],
    };
  },
  methods: {
    toggleMatches() {
      this.displayMatches =! this.displayMatches
      this.boxEdited()
    },
    boxEdited() {
      if (process.client) {
        //when box edited
        let element = this.$refs.matchbox
        let text = element.innerText || element.textContent || ""
        text = text.replace(this.regex, '<span style="background-color: yellow">$&</span>');
        setTimeout(()=> {
          this.dataText = text
        },200)
      }
    }
  },
  components:{
      TransitionExpand
  },
  computed: {
    showText() {
        if(this.displayMatches) 
            return "hide matches";
        else
            return "show matches";
    },
  },
  watch: {
      regex : (oldv,newv) => {
          console.log("changed")
          this.nextTick(()=>{
              this.boxEdited()
          })
          
      }
  },
  mounted() {
    this.dataText = this.sampleText.join('\n')
    // this.boxEdited()
  }
}
</script>

<style>
.text__highlight {
    white-space: pre-line;
    margin:2px;
    background: hsla(160, 100%, 73%, 0.3)!important;
}
</style>
