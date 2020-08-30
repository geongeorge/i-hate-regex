<template>
  <div class="matchbox-wrapper">
    <div class="flex w-full flex-row">
      <div class="text-sm float-right mr-2">
        <!-- eslint-disable-next-line -->
        <a
          href="#"
          class="text-dark-muted hover:underline"
          @click="toggleMatches"
        >{{ showText }}</a>
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
import TransitionExpand from "./TransitionExpand";
import pastePlainText from "~/mixins/pastePlainText.js";
import autosize from "autosize";

// Debounce timer for editing change
let typeTimeout;

export default {
  components: {
    TransitionExpand
  },
  mixins: [pastePlainText],
  props: {
    regex: { required: true },
    sampleText: { default: ["Lorem ipsum"] }
  },
  data() {
    return {
      displayMatches: true,
      queries: [],
      isTyping: false,
      loaded: false
    };
  },
  computed: {
    showText() {
      if (this.displayMatches) {
        return "hide matches";
      }
      return "show matches";
    },
    dataText() {
      return this.sampleText.join("\n") || "";
    }
  },
  watch: {
    regex: function() {
      // eslint-disable-line
      this.boxEdited();
    }
  },
  mounted() {
    this.boxEdited();
    // setTimeout(this.boxEdited(), 50)

    //set loaded to true
    this.loaded = true;
  },
  methods: {
    toggleMatches() {
      this.displayMatches = !this.displayMatches;
      this.boxEdited();
    },
    htmlEncode(s) {
      return s
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    },
    resizeTextarea() {
      // fix rreduction of height
      let textarea = this.$refs.matchbox;
      autosize(textarea);
    },
    getMatchTextOnly() {
      const element = this.$refs.matchbox;
      const text =
        element.value || element.innerText || element.textContent || ""; //get inner text without html
      return text;
    },
    applyHighlights(text) {
      let fixedText = this.htmlEncode(text);
      fixedText = fixedText.replace(/\n$/g, "\n\n");
      fixedText = `<mark>${fixedText}</mark>`;
      return fixedText;
    },
    hideCanvas(val = true) {
      const highlights = this.$refs.highlights;

      if (val) {
        highlights.classList.add("hidden");
      } else {
        highlights.classList.remove("hidden");
      }
    },
    boxEdited() {
      if (process.client) {
        let text = this.getMatchTextOnly();
        let markedText = "";
        let matches;
        // Check for g flag, if not don't use matchAll
        // see https://stackoverflow.com/a/60290199/8134823
        // matchAll throws an error when g flag is missing
        if (this.regex.flags.includes("g")) {
          matches = [...text.matchAll(this.regex)];
        } else {
          // if matches? add to array else empty []
          matches = text.match(this.regex) ? [text.match(this.regex)] : [];
        }

        // each match will have
        //   0 -> match
        //   1,2,etc -> group matches
        //   index -> pos of
        //   input -> input str
        //   length -> number of matches incl groups
        let lastEndPos = 0;
        let lastPart = "";
        for (let match of matches) {
          // The text is divided into 4 parts
          //   alreadyParsedText => which need not be encoded(fixed)
          //   beginPart => The text between already parsed and start of matched text
          //                 Should be encoded
          //   matchStr => String that is matched
          //               Encoded, but added <mark></mark> tags which will not be encoded for highlights
          //   lastPart => rest of the string, not highlighted/fixed
          //
          const startPos = match.index;
          const endPos = startPos + match[0].length;

          const lengthOfBeginPart = startPos - lastEndPos;

          const beginPart = text.substr(lastEndPos, lengthOfBeginPart);
          lastPart = text.substr(endPos);

          //string matched
          const matchStr = text.substr(startPos, match[0].length);

          const encodedMatchStr = this.applyHighlights(matchStr);
          // html encoded parts
          const encodedBeginPart = this.htmlEncode(beginPart);

          // text from begining to match string (including)
          const textTillStr = encodedBeginPart + encodedMatchStr;

          markedText += textTillStr;

          // Add lastIndex the length of begin part + matchStr
          lastEndPos = endPos;
        }
        // add the final unmatched lastPart
        markedText += this.htmlEncode(lastPart);

        this.$refs.highlights.innerHTML = markedText;

        setTimeout(() => {
          this.resizeTextarea();
        }, 50);
      }
    },
    matchboxChanged() {
      // eslint-disable-line
      this.resizeTextarea();
      if (typeTimeout) {
        clearTimeout(typeTimeout);
      }
      typeTimeout = setTimeout(() => {
        this.boxEdited();
      }, 50);
    }
  }
};
</script>

<style></style>
