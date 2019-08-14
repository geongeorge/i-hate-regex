<template>
  <div>
    <div class="flex w-full flex-row">
      <div class="text-sm float-right mr-2">
        <a href="#" class="text-gray-500 hover:underline" @click="toggleMatches">{{ showText }}</a>
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
          @keyup="matchboxChanged"
          ref="matchbox"
          v-html="dataText"
          @paste.prevent="onPaste"
        ></div>
      </div>
    </transition-expand>
  </div>
</template>

<script>
import TransitionExpand from "./TransitionExpand";
import pastePlainText from '~/mixins/pastePlainText.js';
var typeTimeout;

export default {
  mixins:[pastePlainText],
  props: {
    regex: { default: "/(?:)/" },
    sampleText: { default: ["Lorem ipsum"] }
  },
  data() {
    return {
      displayMatches: false,
      dataText: "",
      queries: [],
      isTyping: false
    };
  },
  methods: {
    toggleMatches() {
      this.displayMatches = !this.displayMatches;
      this.boxEdited();
    },
    getMatchTextOnly() {
      let element = this.$refs.matchbox;
      let text = element.innerText || element.textContent || ""; //get inner text without html
      return text;
    },
     boxEdited() {
      if (process.client) {
        //when box edited
        //somehow need to locate the cursor location and place it there
        let text = this.getMatchTextOnly(); //get inner text without html
        // replace text with highlight html included
        text = text.replace(
          this.regex,
          '<span class="bg-green-200 rounded px-1">$&</span>'
        );

        this.dataText = text
      }
     },
    boxEditedNew() {
      if (process.client) {
        //when box edited
        //somehow need to locate the cursor location and place it there
        let text = this.getMatchTextOnly(); //get inner text without html
        // replace text with highlight html included
        // text = text.replace(
        //   this.regex,
        //   '<span class="bg-green-200 rounded px-1">$&</span>'
        // );
        // replace text with highlight html included

        // the below part to be fixed : match inner groups of regex
        let matches;
        let i = 0;
        let temptext = text;
        while ((matches = this.regex.exec(text)) !== null) {
          // some text...[s]match[e]..end text
          // s-> start pos = index
          // e-> end pos = index+length
          // we will change the match and re-concatinate
          let startPos = matches.index
          let endPos= matches.index+ matches[0].length

          let beginPart = text.substr(0,startPos)
          let lastPart = text.substr(endPos)
          //string matched
          let matchStr = text.substr(startPos,matches[0].length)

          matchStr = "<span class='bg-green-200 rounded border border-green-200 hover:border-blue-400'>"+matchStr+"</span>"

          // text from begining to match string (including)
          let textTillStr = beginPart + matchStr;

          text = textTillStr  + lastPart;

          // Add lastIndex the length of begin part + matchStr

          this.regex.lastIndex = textTillStr.length

          // the below logic is to match inner groups
          // currently Geon has no idea how to achieve this 
          // since inner groups do not provide an index 
          // if(matches.length>1){
          //   // for(let i=1; i<matches.length; i++) {
          //   //   console.log(matchStr);
          //   // }
          // }

          console.log(matches)
          // console.log(beginPart+"!"+matchStr+'!'+lastPart)
          // console.log(matches);
         
         i++;
        }

        setTimeout(() => {
          this.dataText = text;
        }, 200);
      }
    },
    matchboxChanged(event) {
      var node = this.$refs.matchbox;
      // console.log(typeTimeout);
      if (typeTimeout) {
        clearTimeout(typeTimeout);
      }
      typeTimeout = setTimeout(() => {
        this.boxEdited();
      }, 2000);
    }
  },
  components: {
    TransitionExpand
  },
  computed: {
    showText() {
      if (this.displayMatches) return "hide matches";
      else return "show matches";
    }
  },
  watch: {
    regex: function(oldv, newv) {
      this.boxEdited();
    }
  },
  mounted() {
    // set datatext to sample text array from props
    this.dataText = this.sampleText.join("\n");
    // this.boxEdited()
  }
};
</script>

<style>
.text__highlight {
  white-space: pre-line;
  margin: 2px;
  background: hsla(160, 100%, 73%, 0.3) !important;
}
</style>
