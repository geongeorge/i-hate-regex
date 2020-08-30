<template>
  <expr
    :id="myregex.id"
    :iregex="new RegExp(myregex.regex)"
    :iflag="myregex.flag"
    :imatch-text="myregex.matchText"
    :e-height="myregex.embedHeight"
    :tags="myregex.tags"
  >
    <span slot="title">{{ myregex.title }}</span>

    <span slot="tagline">{{ myregex.tagline }}</span>

    <p slot="description">
      {{ myregex.description }}
    </p>

    <div slot="seconddescr">
      <p>
        embed height:
        <input
          id="myRange"
          v-model="myregex.embedHeight"
          type="range"
          min="1"
          max="800"
          class="slider"
        />
      </p>
      <div class="text-sm text-gray-700 my-2 mt-16">
        [this page under construction]
        <ul class="list-inside list-disc">
          <li>
            <a
              class="hover:underline"
              href="https://github.com/geongeorge/i-hate-regex"
            >view on github</a>
          </li>
        </ul>
      </div>
    </div>
  </expr>
</template>

<script>
import expr from "~/components/layouts/expr.vue";
export default {
  components: {
    expr
  },
  data() {
    return {
      // regex: regexdata
      myregex: {
        id: "",
        title: "playground",
        tagline: "play around with regex",
        description: "",
        seconddescr: "",
        regex: "^[a-z0-9_-]{3,15}$",
        flag: "gm",
        matchText: ["lorem", "ipsum"],
        embedHeight: 300,
        tags: []
      }
    };
  },
  computed: {},
  head() {
    return {
      title: "Regex for " + this.myregex.title + " - IHateRegex",
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        {
          hid: "description",
          name: "description",
          content: this.myregex.description
        }
      ]
    };
  }
};
</script>

<style></style>
