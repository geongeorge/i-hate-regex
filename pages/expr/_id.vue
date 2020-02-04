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
      <div v-html="$md.render(markdown)"></div>
      <br />
      <h2 class="text-2xl">
        Cheatsheet
      </h2>
      <CheatTable :input-regex="myregex.cheatRegex" />
      <div class="text-base text-green-600 my-2 underline">
        <nuxt-link to="/cheatsheet">
          view full cheatsheet
        </nuxt-link>
      </div>
    </div>
  </expr>
</template>

<script>
import expr from "~/components/layout-g/expr.vue"
import CheatTable from "~/components/post-components/CheatTable"
import regexdata from "~/static/regex/data.json"
export default {
  components: {
    expr,
    CheatTable
  },
  async asyncData({ $axios, params }) {
    const path = `/regex/markdown/${params.id}.md`

    var markdown = ""

    if (process.server) {
      // if server -> get file using fs.readFileSync
      const fs = require("fs")
      try {
        if (fs.existsSync("static" + path)) {
          //file exists
          markdown = fs.readFileSync("static" + path, "utf8")
        }
      } catch (err) {
        /* do nothing */
      }
    } else {
      try {
        // client mode -> use axios
        markdown = await $axios.$get(path)
      } catch (e) {
        /* do nothing */
      }
    }

    return { markdown }
  },
  data() {
    return {
      // regex: regexdata
      id: this.$route.params.id
    }
  },
  computed: {
    myregex() {
      return regexdata.find(val => {
        return val.id == this.id
      })
    }
  },
  validate({ params, query, store }) { // eslint-disable-line
    var val = regexdata.find(val => {
      return val.id == params.id
    })
    if (val) {
      return true
    } else {
      return false
    }
  },
  head() {
    const thisregex = regexdata.find(val => {
      return val.id == this.id
    })
    return {
      title: "Regex for " + thisregex.title + " - iHateRegex",
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        {
          hid: "description",
          name: "description",
          content: thisregex.firstdescr
        }
      ]
    }
  }
}
</script>

<style></style>
