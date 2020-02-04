<template>
  <div>
    <div class="container mx-auto md:pt-5 lg:pt-20 px-4 max-w-2xl">
      <div class="text-center">
        <Logo />
        <SearchBox :init-query="query" @changed="searchAction" />
        <div v-if="query">
          <SearchResult
            v-for="(item, key) in searchResults"
            :id="item.id"
            :key="key"
            :title="item.title"
          >
            {{ item.firstdescr }}
          </SearchResult>

          <NoResults v-if="searchResults.length < 1" />
        </div>
        <div v-else>
          <div class="mt-10 text-gray-900 text-2xl">
            <ul class="flex flex-wrap justify-center mx-2">
              <li v-for="(item, key) in catalog" :key="key" class="mx-3">
                <nuxt-link :to="'/expr/' + item.id" class="hover:underline">
                  {{ item.title }}
                </nuxt-link>
              </li>
            </ul>
          </div>
        </div>
        <p class="text-gray-600 mt-5">
          <!-- <a href="#" class="hover:underline">see all</a> -->
        </p>

        <div class="text-gray-500 mt-10 text-sm">
          <ul class="flex flex-wrap justify-center mx-2">
            <li class="mx-3">
              <nuxt-link to="/playground" class="hover:underline">
                playground
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

import jsonData from "~/regex/regexdata.json"

export default {
  components: {
    Logo,
    SearchBox,
    SearchResult,
    NoResults
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
        keys: ["title", "firstdescr", "tags"]
      }
      this.$search(this.query, this.catalog, options).then(results => {
        this.searchResults = results
      })
    }
  },
  head() {
    return {
      title: "Regex cheatsheet - I Hate Regex",
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        {
          hid: "description",
          name: "description",
          content: "Stop hating regex and start learning."
        }
      ]
    }
  }
}
</script>

<style></style>
