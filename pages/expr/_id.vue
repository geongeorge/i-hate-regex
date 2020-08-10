<template>
  <div>
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
        <!-- render markdown for second description -->
        <div class="long-description" v-html="$md.render(markdown)"></div>
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
  </div>
</template>

<script>
import expr from "~/components/layouts/expr.vue";
import CheatTable from "~/components/post-components/CheatTable";
import regexdata from "~/static/regex/data.json";
export default {
  components: {
    expr,
    CheatTable
  },
  async asyncData({ $axios, params }) {
    const path = `/regex/markdown/${params.id}.md`;

    let markdown = "";

    if (process.server) {
      // if server -> get file using fs.readFileSync
      const fs = require("fs");
      try {
        if (fs.existsSync("static" + path)) {
          //file exists
          markdown = fs.readFileSync("static" + path, "utf8");
        }
      } catch (err) {
        /* do nothing */
      }
    } else {
      try {
        // client mode -> use axios
        markdown = await $axios.$get(path);
      } catch (e) {
        /* do nothing */
      }
    }

    return { markdown };
  },
  data() {
    return {
      // regex: regexdata
      id: this.$route.params.id
    };
  },
  computed: {
    myregex() {
      return regexdata.find(val => {
        return val.id == this.id;
      });
    }
  },
  validate({ params, query, store }) {
    // eslint-disable-line
    const val = regexdata.find(val => {
      return val.id == params.id;
    });
    return val;
  },
  head() {
    const thisregex = regexdata.find(val => {
      return val.id == this.id;
    });
    return {
      title: "Regex for " + thisregex.title + " - iHateRegex",
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        {
          hid: "description",
          name: "description",
          content: thisregex.description
        }
      ]
    };
  }
};
</script>

<style>
.long-description ul {
  @apply list-inside list-disc;
}
.long-description ol {
  @apply list-inside list-decimal;
}

.long-description code {
  @apply bg-gray-200 rounded text-green-700;
}

.long-description h4 {
  @apply text-xl;
}

.long-description h3 {
  @apply text-2xl;
}

.long-description h2 {
  @apply text-3xl;
}

.long-description h1 {
  @apply text-4xl;
}
.long-description p {
  @apply mt-3;
}

.long-description a {
  @apply text-green-600;
}
.long-description a:hover {
  @apply border-green-400 border-b-2;
}
</style>
