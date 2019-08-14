<template>
  <div>
    <a href="#">
      <h1 class="text-2xl group">
        <span class="group-hover:text-red-600">#</span> username
      </h1>
    </a>
    <p class="text-sm text-gray-500">match a valid username</p>
    <div class="mt-8">
      <CodeBox :regex="regex" :flag="flag" @regexChanged="regexChanged"></CodeBox>
    </div>

    <MatchBox :regex="regex" :sampleText="matchText"></MatchBox>

    <p
      class="mt-8"
    >Lorem ipsum, dolor sit amet consectetur adipisicing elit. Beatae ea commodi, consectetur sint labore, reiciendis reprehenderit quaerat quam provident accusamus numquam, harum quo praesentium corrupti. Ab aspernatur architecto ipsum accusantium.</p>
    <div>
      <RegvizEmbed :regex="regex"></RegvizEmbed>
    </div>
  </div>
</template>

<script>
import Logo from "~/components/utils/Logo";
import CodeBox from "~/components/post-components/CodeBox";
import MatchBox from "~/components/post-components/MatchBox";

import RegvizEmbed from "~/components/post-components/RegvizEmbed";

export default {
  layout: "post",
  components: {
    Logo,
    CodeBox,
    MatchBox,
    RegvizEmbed
  },
  data() {
    return {
      regex: /^[a-z0-9_-]{3,15}$/gm,
      flag: "gm",
      matchText: [
        "lorem",
        "geon",
        "gr3at",
        "a",
        "ab",
        "abc",
        "abcd",
        "yo yossj",
        "mahga",
        "abcdefghijklmnopqrst"
      ]
    };
  },
  methods: {
    regexChanged(event) {
      this.regex = new RegExp(event.regex, event.flag);
    }
  }
};
</script>

<style>
</style>
