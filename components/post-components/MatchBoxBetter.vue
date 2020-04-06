<template>
  <div>
    <div class="flex w-full flex-row">
      <div class="text-sm float-right mr-2">
        <!-- eslint-disable-next-line -->
        <a href="#" class="text-gray-500 hover:underline" @click="toggleMatches">{{ showText }}</a>
      </div>
    </div>
    <transition-expand>
      <div v-show="displayMatches">
        <div id="matchbox-container">
          <div class="backdrop">
            <div ref="highlights" class="highlights">
              <!-- cloned text with <mark> tags here -->
            </div>
          </div>
          <textarea
            id="matchbox"
            ref="matchbox"
            contenteditable="true"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            @keyup="matchboxChanged"
            v-html="dataText"
          />
        </div>
      </div>
    </transition-expand>
  </div>
</template>

<script>
import TransitionExpand from "./TransitionExpand"
import pastePlainText from "~/mixins/pastePlainText.js"
import autosize from "autosize"
var typeTimeout

export default {
  components: {
    TransitionExpand
  },
  mixins: [pastePlainText],
  props: {
    regex: { default: "/(?:)/" },
    sampleText: { default: ["Lorem ipsum"] }
  },
  data() {
    return {
      displayMatches: false,
      dataText: "",
      queries: [],
      isTyping: false,
      loaded: false
    }
  },
  computed: {
    showText() {
      if (this.displayMatches) {
        return "hide matches"
      }
      return "show matches"
    }
  },
  watch: {
    regex: function() {
      // eslint-disable-line
      this.boxEdited()
    }
  },
  mounted() {
    // set datatext to sample text array from props
    this.dataText = this.sampleText.join("\n")
    // this.boxEdited()
    setTimeout(this.toggleMatches, 50)

    //set loaded to true
    this.loaded = true
  },
  methods: {
    toggleMatches() {
      this.displayMatches = !this.displayMatches
      this.boxEdited()
    },
    HtmlEncode(s) {
      var text = s
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
      return text
    },
    resizeTextarea() {
      // fix rreduction of height
      let textarea = this.$refs.matchbox
      autosize(textarea)
    },
    getMatchTextOnly() {
      const element = this.$refs.matchbox
      const text =
        element.value || element.innerText || element.textContent || "" //get inner text without html
      return text
    },
    applyHighlights(text) {
      let fixedText = this.HtmlEncode(text)
      fixedText = fixedText.replace(/\n$/g, "\n\n")
      fixedText = `<mark>${fixedText}</mark>`
      return fixedText
    },
    hideCanvas(val = true) {
      const highlights = this.$refs.highlights

      if (val) {
        highlights.classList.add("hidden")
      } else {
        highlights.classList.remove("hidden")
      }
    },
    boxEdited() {
      if (process.client) {
        // when box edited
        // somehow need to locate the cursor location and place it there
        let text = this.getMatchTextOnly() //get inner text without html
        // replace text with highlight html included

        let matches
        let lastEndPos = 0
        this.regex.lastIndex = 0

        while ((matches = this.regex.exec(text)) !== null) {
          // some text...[s]match[e]..end text
          // s-> start pos = index
          // e-> end pos = index+length
          // we will change the match and re-concatinate
          // The text is divided into 4 parts
          //   alreadyParsedText => which need not be encoded(fixed)
          //   beginPart => The text between already parsed and start of matched text
          //                 Should be encoded
          //   matchStr => String that is matched
          //               Encoded, but added <mark></mark> tags which will not be encoded for highlights
          //   lastPart => rest of the string, not highlighted/fixed
          //
          const startPos = matches.index
          const endPos = matches.index + matches[0].length
          // each time text will only matct section from last end position
          const alreadyParsedText = text.substr(0, lastEndPos)

          const lengthOfBeginPart = startPos - lastEndPos

          const beginPart = text.substr(lastEndPos, lengthOfBeginPart)
          const lastPart = text.substr(endPos)
          //string matched
          const matchStr = text.substr(startPos, matches[0].length)

          const fixedMatchStr = this.applyHighlights(matchStr)

          // fixed parts
          const fixedBeginPart = this.HtmlEncode(beginPart)

          // no need to fix last part

          // text from begining to match string (including)
          const textTillStr = alreadyParsedText + fixedBeginPart + fixedMatchStr

          text = textTillStr + lastPart

          // console.log(text)

          // Add lastIndex the length of begin part + matchStr
          this.regex.lastIndex = textTillStr.length
          lastEndPos = this.regex.lastIndex
        }

        this.$refs.highlights.innerHTML = text

        setTimeout(() => {
          this.resizeTextarea()
        }, 50)
      }
      //  end if process.client
    },
    matchboxChanged() {
      // eslint-disable-line
      this.resizeTextarea()
      if (typeTimeout) {
        clearTimeout(typeTimeout)
      }
      typeTimeout = setTimeout(() => {
        this.boxEdited()
      }, 50)
    }
  }
}
</script>

<style>
.text__highlight {
  white-space: pre-line;
  margin: 2px;
  background: hsla(160, 100%, 73%, 0.3) !important;
}
#matchbox-container {
  @apply relative bg-blue-100 rounded mb-2 shadow-inner overflow-hidden;
  z-index: 0 !important;
  height: auto;
}
#matchbox {
  @apply relative text-gray-600 text-lg p-3 whitespace-pre z-10 w-full bg-transparent;
  z-index: 10 !important;
  white-space: pre-wrap;
  min-height: 50px;
}
#matchbox:focus {
  border: none;
  outline: none;
}
#matchbox-container .backdrop {
  overflow: auto;
}

#matchbox-container .highlights {
  @apply absolute top-0 left-0 w-full p-3 text-lg;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-spacing: 0px;
  color: transparent;
}

#matchbox-container mark {
  @apply rounded;
  background-color: #d4e9ab;
  color: transparent;
}
</style>
