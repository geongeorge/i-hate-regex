<template>
  <post :id="id" :tags="tags">
    <article>
      <header class="expr-header">
        <h1>
          regex for
          <span class="keyword">
            <slot name="title" />
          </span>
        </h1>
        <h3>
          <slot name="tagline" />
        </h3>
      </header>

      <div class="codebox-wrapper">
        <CodeBox :regex="regex" :flag="flag" @regexChanged="regexChanged" />
      </div>

      <MatchBox :regex="regex" :sample-text="matchText" />

      <div class="mt-8">
        <slot name="description" />
      </div>
      <div>
        <RegvizEmbed :regex="regex" :height="eHeight" />
      </div>
      <div class="mt-8">
        <div class="md:flex">
          <div class="flex-grow">
            <slot name="seconddescr" />
          </div>
          <div class="px-6 sponsor-bar flex-col justify-center">
            <div class="font-bold text-gray-500 text-center">
              Our Sponsors
            </div>
            <div class="flex flex-col sm:flex-row md:flex-col">
              <div class="mt-6 w-full w-2/5 sponsor-effect">
                <a
                  href="http://bit.ly/datree-ihr"
                  rel="noopener nofollow"
                  target="_blank"
                >
                  <img
                    class="sponsor mx-auto"
                    src="https://assets.website-files.com/5d514f718e8309c01d798013/5d8b4657e7740e300666e3cc_datree_LOGO%20FLAT%20h-p-500.png"
                    alt="datree.io"
                  />
                </a>
              </div>
              <div class="mt-6 w-full w-2/5 sponsor-effect">
                <a
                  href="http://bit.ly/ihr-telegram"
                  rel="noopener nofollow"
                  target="_blank"
                >
                  <img
                    class="sponsor mx-auto"
                    src="~/assets/images/telegram-group.svg"
                    alt="datree.io"
                  />
                </a>
              </div>
              <div class="mx-auto  w-full text-center mt-10">
                <nuxt-link to="/donate"
                           class="p-2 text-white font-bold underline text-red-400 hover:text-red-600 rounded"
                >
                  Support this project
                </nuxt-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  </post>
</template>

<script>
//base layout
import post from "~/components/layouts/base/post";

import CodeBox from "~/components/post-components/CodeBox";
import MatchBox from "~/components/post-components/MatchBoxBetter";

import RegvizEmbed from "~/components/post-components/RegvizEmbed";

export default {
  layout: "post",
  components: {
    post,
    CodeBox,
    MatchBox,
    RegvizEmbed
  },
  props: {
    iregex: { default: / / }, //input regex
    iflag: { default: "gm" }, //input flags
    imatchText: { default: ["lorem ipsum"] }, //input text
    eHeight: { default: 400 }, //embed regviz height
    tags: { default: () => [] }, // Arrays need to be defaulted to factory function
    id: { default: "" }
  },
  data() {
    return {
      regex: / /g,
      flag: "",
      matchText: []
    };
  },
  created() {
    this.regex = this.iregex;
    this.flag = this.iflag;
    this.matchText = this.imatchText;
  },
  methods: {
    regexChanged(event) {
      this.regex = new RegExp(event.regex, event.flag);
    }
  }
};
</script>
<style>
.sponsor-bar {
  min-width: 200px;
}
.sponsor-effect {
  opacity: 0.8;
  transition: opacity 200ms ease-out;
}
.sponsor-effect:hover {
  opacity: 1;
}
.sponsor {
  width: 130px;
}
</style>
