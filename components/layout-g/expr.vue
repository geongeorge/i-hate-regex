<template>
  <post :id="id" :tags="tags">
    <div>
      <a href="#">
        <h1 class="text-2xl group">
          <span class="group-hover:text-red-600">#</span>
          <slot name="title" />
        </h1>
      </a>
      <p class="text-sm text-gray-500">
        <slot name="tagline" />
      </p>
      <div class="mt-8">
        <CodeBox :regex="regex" :flag="flag" @regexChanged="regexChanged" />
      </div>

      <MatchBox :regex="regex" :sample-text="matchText" />

      <div class="mt-8">
        <slot name="firstdescr" />
      </div>
      <div>
        <RegvizEmbed :regex="regex" :height="eHeight" />
      </div>
      <div class="mt-8">
        <slot name="seconddescr" />
      </div>
    </div>
  </post>
</template>

<script>
//base layout
import post from "~/components/layout-g/base/post"

import Logo from "~/components/utils/Logo"
import CodeBox from "~/components/post-components/CodeBox"
import MatchBox from "~/components/post-components/MatchBox"

import RegvizEmbed from "~/components/post-components/RegvizEmbed"

export default {
  layout: "post",
  components: {
    post,
    Logo,
    CodeBox,
    MatchBox,
    RegvizEmbed
  },
  props: {
    iregex: { default: / / }, //input regex
    iflag: { default: "gm" }, //input flags
    imatchText: { default: ["lorem ipsum"] }, //input text
    eHeight: { default: 400 }, //embed regviz height
    tags: { default: [] },
    id: { default: "" }
  },
  data() {
    return {
      regex: / /,
      flag: "",
      matchText: []
    }
  },
  created() {
    this.regex = this.iregex
    this.flag = this.iflag
    this.matchText = this.imatchText
  },
  methods: {
    regexChanged(event) {
      this.regex = new RegExp(event.regex, event.flag)
    }
  }
}
</script>
