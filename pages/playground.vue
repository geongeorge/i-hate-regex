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

    <p slot="firstdescr">
      {{ myregex.firstdescr }}
    </p>

    <div slot="seconddescr">
      <p>
        embed height: 
        <input type="range" min="1" max="800" v-model="myregex.embedHeight" class="slider" id="myRange">
      </p>
      <div class="text-sm text-gray-700 my-2 mt-16">
        [this page under construction]
        <ul class="list-inside list-disc">
            <li>
                <a class="hover:underline" href="https://www.buymeacoffee.com/geon">support development</a>
            </li>
            <li>
                <a class="hover:underline" href="https://github.com/geongeorge/i-hate-regex">view on github</a>
            </li>
        </ul>
      </div>
    </div>
  </expr>
</template>

<script>
import expr from "~/components/layout-g/expr.vue"
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
        tagline: "play around with iHateRegex",
        firstdescr: "",
        seconddescr: "",
        regex: "^[a-z0-9_-]{3,15}$",
        flag: "gm",
        matchText: ["lorem", "ipsum"],
        embedHeight: 300,
        tags: ["name", "slug"]
      }
    }
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
          content: this.myregex.firstdescr
        }
      ]
    }
  }
}
</script>

<style></style>
