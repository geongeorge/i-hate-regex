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
        ></div>
      </div>
    </transition-expand>
  </div>
</template>

<script>
import TransitionExpand from "./TransitionExpand";

var typeTimeout;

export default {
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
    boxEdited() {
      if (process.client) {
        //when box edited
        //somehow need to locate the cursor location and place it there
        let element = this.$refs.matchbox;
        let text = element.innerText || element.textContent || "";
        text = text.replace(
          this.regex,
          '<span class="bg-green-200 rounded px-1">$&</span>'
        );
        setTimeout(() => {
          this.dataText = text;
        }, 200);
      }
    },
    matchboxChanged(event) {
      var node = this.$refs.matchbox;
      console.log(typeTimeout)
      if(typeTimeout) {
        clearTimeout(typeTimeout)
      }
      typeTimeout = setTimeout(()=> {
        this.boxEdited();
      },2000)  
    },
    // getCursorPos() {
    //   var cursorPos;
    //   if (window.getSelection) {
    //     var selObj = window.getSelection();
    //     var selRange = selObj.getRangeAt(0);
    //     cursorPos =
    //       this.findNode(selObj.anchorNode.parentNode.childNodes, selObj.anchorNode) +
    //       selObj.anchorOffset;
    //     /* FIXME the following works wrong in Opera when the document is longer than 32767 chars */
    //     return cursorPos;
    //   } else if (document.selection) {
    //     var range = document.selection.createRange();
    //     var bookmark = range.getBookmark();
    //     /* FIXME the following works wrong when the document is longer than 65535 chars */
    //     cursorPos = bookmark.charCodeAt(2) - 11; /* Undocumented function [3] */
    //     return cursorPos;
    //   }
    // },
    // findNode(list, node) {
    //   for (var i = 0; i < list.length; i++) {
    //     if (list[i] == node) {
    //       return i;
    //     }
    //   }
    //   return -1;
    // }
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
    regex: (oldv, newv) => {
      console.log("changed");
      this.nextTick(() => {
        this.boxEdited();
      });
    }
  },
  mounted() {
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
