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
      var el = document.createElement("div")
      el.innerText = el.textContent = s
      s = el.innerHTML
      el.parentNode.removeChild(el)
      return s
    },
    resizeTextarea() {
      // fix rreduction of height
      let textarea = this.$refs.matchbox
      let scrollHeight =
        textarea.scrollHeight <= 0
          ? textarea.clientHeight
          : textarea.scrollHeight
      textarea.style.height = "auto"
      textarea.style.height = scrollHeight + "px"

      console.log("scroll", textarea.scrollHeight)
    },
    getMatchTextOnly() {
      const element = this.$refs.matchbox
      const text =
        element.value || element.innerText || element.textContent || "" //get inner text without html
      return text
    },
    applyHighlights(text) {
      let fixedText = text.replace(/\n$/g, "\n\n")
      fixedText = fixedText.replace(this.regex, `<mark>$&</mark>`)
      return fixedText
    },
    boxEdited() {
      if (process.client) {
        // when box edited
        // somehow need to locate the cursor location and place it there
        let text = this.getMatchTextOnly() //get inner text without html
        // replace text with highlight html included
        var highlightedText = this.applyHighlights(text)

        this.$refs.highlights.innerHTML = highlightedText

        console.log(text)

        setTimeout(() => {
          this.resizeTextarea()
        }, 1000)
      }
    },
    matchboxChanged() {
      // eslint-disable-line
      this.resizeTextarea()
      if (typeTimeout) {
        clearTimeout(typeTimeout)
      }
      typeTimeout = setTimeout(() => {
        this.boxEdited()
      }, 200)
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
}

#matchbox-container mark {
  @apply rounded;
  color: transparent;
  background-color: #d4e9ab; /* or whatever */
}
</style>
