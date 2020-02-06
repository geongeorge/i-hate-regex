<template>
  <div>
    <div class="container mx-auto md:pt-5 lg:pt-20 px-4 max-w-2xl">
      <div class="text-center">
        <Logo />
        <p class="text-gray-600 italic my-4">
          Now you have two problems.
        </p>
        <SearchBox :init-query="query" @changed="searchAction" />
        <div v-if="query">
          <SearchResult
            v-for="(item, key) in searchResults"
            :id="item.id"
            :key="key"
            :title="item.title"
          >
            {{ item.description }}
          </SearchResult>

          <NoResults v-if="searchResults.length < 1" />
        </div>
        <div v-else>
          <CommonResults />
        </div>
        <p class="text-gray-600 mt-5">
          <!-- <a href="#" class="hover:underline">see all</a> -->
        </p>

        <div class="text-gray-500 mt-10 text-sm">
          <ul class="flex flex-wrap justify-center xmx-2">
            <li class="mx-3">
              <nuxt-link to="/playground" class="hover:underline">
                playground
              </nuxt-link>
            </li>

            <li class="mx-3">
              <nuxt-link to="/expr" class="hover:underline">
                all
              </nuxt-link>
            </li>

            <li class="mx-3">
              <a
                href="https://forms.gle/Cwo3VupujQJzeoYQ9"
                class="hover:underline"
                target="_blank"
                >submit</a
              >
            </li>
            <li class="mx-3">
              <a
                href="https://github.com/geongeorge/i-hate-regex"
                class="hover:underline"
                target="_blank"
                >github</a
              >
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Logo from "~/components/utils/Logo"
import SearchBox from "~/components/utils/SearchBox"
import SearchResult from "~/components/utils/SearchResult"
import NoResults from "~/components/utils/NoResults"
import CommonResults from "~/components/utils/CommonResults"

import jsonData from "~/static/regex/data.json"

export default {
  components: {
    Logo,
    SearchBox,
    SearchResult,
    NoResults,
    CommonResults
  },
  data() {
    return {
      query: "",
      catalog: jsonData,
      searchResults: []
    }
  },
  computed: {
    filteredList() {
      return this.catalog.filter(post => {
        return post.key.toLowerCase().includes(this.query.toLowerCase())
      })
    }
  },
  created() {
    this.query = this.$route.query.q ? this.$route.query.q : this.query
    this.$forceUpdate()
  },
  methods: {
    searchAction(event) {
      this.query = event
      this.$router.push({ path: this.$route.path, query: { q: this.query } })
      this.fuseSearch()
    },
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
        this.searchResults = results
      })
    }
  },
  head() {
    return {
      title: "i Hate Regex - regex cheatsheet for haters",
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        {
          hid: "description",
          name: "description",
          content:
            "i Hate Regex is a regex cheatsheet that also explains the commonly used expressions so that you understand it. Stop hating and start learning."
        }
      ]
    }
  }
}
</script>

<style></style>
