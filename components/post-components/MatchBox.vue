<template>
  <div>
    <div class="flex w-full flex-row">
      <div class="text-sm float-right mr-2">
        <a
          href="#"
          class="text-gray-500 hover:underline"
          @click="displayMatches =! displayMatches"
        >{{ showText }}</a>
      </div>
    </div>
    <transition-expand>
    <div v-if="displayMatches">
      <div
        class="text-gray-600 text-lg p-3 rounded focus:outline-none bg-blue-100 mb-2 shadow-inner"
        contenteditable="true"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        id="matchbox"
        @keyup="matchedKW"
      >
      <text-highlight 
      :queries="queries"
      :highlightClass="['bg-red-200', 'rounded']"
      >
      {{sampleText}}
      </text-highlight>
      </div>
      </div>
    </transition-expand>
  </div>
</template>

<script>
import TransitionExpand from './TransitionExpand'
export default {
    props: {
        regex : {default: "/(?:)/"}
    },
  data() {
    return {
      displayMatches: false,
      queries: [],
      sampleText: `Lorem 
      sdfsdf 
      ipsum dolor sit, amet consectetur adipisicing elit. Aspernatur, cupiditate.Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aspernatur, cupiditate.Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aspernatur, cupiditate.Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aspernatur, 
      cupiditate`
    };
  },
  methods: {
      matchedKW(){
        // let flags = this.regex.replace(/.*\/([gimy]*)$/, '$1');
        // let pattern = this.regex.replace(new RegExp('^/(.*?)/'+flags+'$'), '$1');

        // console.log(flags,pattern)

        // let reg = new RegExp(pattern, flags);

        let reg = this.regex

        let queries = [];

        let match = reg.exec(this.sampleText);
        while (match != null) {
        // matched text: match[0]
        // match start: match.index
        // capturing group n: match[n]
        console.log(match[0])
        queries.push(match[0])
        match = reg.exec(this.sampleText);
        }
        // console.log(reg)
        console.log("queries", queries)
        if(queries != null)
         this.queries = queries
        else 
            this.queries = [];
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
    }
  },
  mounted() {
      this.matchedKW()
  }
}
</script>

<style>
</style>
