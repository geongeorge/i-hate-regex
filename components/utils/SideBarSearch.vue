<template>
  <div class="flex flex-col h-full">
    <div>
      <form autocomplete="off" method="post" action>
        <input
          id="inline-full-name"
          v-model="query"
          class="bg-gray-300 text-1xl appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-gray-100 focus:border-gray-200"
          type="text"
          placeholder="Search"
          @keyup="fuseSearch"
        />
      </form>
    </div>
    <div class="overflow-y-scroll">
      <div v-if="query" class="">
        <SearchResult
          v-for="(item, key) in searchResults"
          :id="item.id"
          :key="key"
          :title="item.title"
          :addclass="['mt-0']"
        >
          {{ item.description.substring(0, 25) + "..." }}
        </SearchResult>
      </div>
      <div
        v-if="!query && related.length !== 0"
        class="opacity-25 hover:opacity-100"
      >
        <h3 class="font-bold">
          Related:
        </h3>
        <SearchResult
          v-for="(item, key) in related"
          :id="item.id"
          :key="key"
          :title="item.title"
          :addclass="['mt-0']"
        >
          {{ item.description.substring(0, 25) + "..." }}
        </SearchResult>
      </div>
    </div>

    <div class="w-full absolute bottom-0 border-t py-3 px-2 bg-gray-200 left-0">
      <!-- <span class="bg-blue-600 p-1 rounded-lg font-bold hover:underline text-white">
      <a href="https://twitter.com/geongeorgek" class="" target="_blank">
      follow @geongeorgek
      </a>
      </span> -->
      <nuxt-link to="/playground">
        <p class="my-2 group">
          <v-icon
            name="magic"
            class="inline-block fill-current text-gray-500 group-hover:text-gray-700"
            scale="1"
          >
          </v-icon>
          playground
        </p>
      </nuxt-link>
      <a href="https://github.com/geongeorge/i-hate-regex" target="_blank">
        <p class="my-2 group">
          <v-icon
            name="brands/github"
            class="inline-block fill-current text-gray-500 group-hover:text-gray-700"
            scale="1"
          >
          </v-icon>
          github
        </p>
      </a>
      <a href="https://forms.gle/Cwo3VupujQJzeoYQ9" target="_blank">
        <p class="my-2 group">
          <v-icon
            name="paper-plane"
            class="inline-block fill-current text-gray-500 group-hover:text-gray-700"
            scale="1"
          >
          </v-icon>
          submit regex
        </p>
      </a>
      <!-- <a href="https://www.buymeacoffee.com/geon" target="_blank">
        <p class="my-2 group">
          <v-icon
            name="mug-hot"
            class="inline-block fill-current text-gray-500 group-hover:text-gray-700"
            scale="1"
          >
          </v-icon>
          buy me a coffee
        </p>
      </a> -->
      <!-- <span class=""> -->
      <!-- eslint-disable-next-line -->
        <!-- <a href="https://www.producthunt.com/posts/i-hate-regex?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-i-hate-regex" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=182905&theme=dark" alt="i Hate Regex - regex cheatsheet for the haters | Product Hunt Embed" style="width: 250px; height: 54px;" width="250px" height="54px"></a> -->
      <!-- </span> -->
    </div>
  </div>
</template>

<script>
import jsonData from "~/static/regex/data.json"
import SearchResult from "~/components/utils/SearchResult"
export default {
  components: {
    SearchResult
  },
  props: {
    tags: { default: () => [] },
    id: { default: "" }
  },
  data() {
    return {
      query: "",
      catalog: jsonData,
      searchResults: [],
      related: []
    }
  },
  mounted() {
    // Search for related
    setTimeout(this.relatedSearch, 500)
  },
  methods: {
    fuseSearch() {
      let options = {
        shouldSort: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ["title", "description", "tags"]
      }
      this.$search(this.query, this.catalog, options).then(results => {
        this.searchResults = results.slice(0, 3) //top 3 search result only
      })
    },
    relatedSearch() {
      let options = {
        shouldSort: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ["title", "description", "tags"]
      }

      // Don't show related if there are no tags or regex
      if (!this.tags) return

      // Don't show more than 3 related
      const noOfRelated = 3
      // Initialize to empty temporary array
      const relatedTemp = []

      for (const tag of this.tags)
        this.$search(tag, this.catalog, options).then(results => {
          // Don't show the same product
          // Filter the id
          relatedTemp.push(...results.filter(elm => elm.id !== this.id))
          // Slice to max length
          if (relatedTemp.length >= noOfRelated) {
            this.related = relatedTemp.slice(0, noOfRelated)
          }
        }) // eslint-disable-line
    }
  }
}
</script>

<style></style>
