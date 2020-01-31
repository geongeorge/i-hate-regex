<template>
<div>
  <div class="container mx-auto md:pt-5 lg:pt-20 px-4 max-w-2xl">
    <div class="text-center">
      <Logo></Logo>
      <p class="text-gray-600 italic my-4">
      Now you have two problems. 
      </p>
      <SearchBox :initQuery="query" @changed="searchAction"></SearchBox>
      <div v-if="query">
        <SearchResult v-for="(item, key) in searchResults" :key="key" :id="item.id" :title="item.title">
        {{item.firstdescr}}
        </SearchResult>

        <NoResults v-if="searchResults.length < 1">
        </NoResults>
      </div>
      <div v-else>
          <CommonResults></CommonResults>
      </div>
      <p class="text-gray-600 mt-5">
            <!-- <a href="#" class="hover:underline">see all</a> -->
        </p>
      
      <div class="text-gray-500 mt-10 text-sm">
        <div class="flex flex-wrap justify-center xmx-2">

          <div class="mx-3">
           <nuxt-link to="cheatsheet/" class="hover:underline">cheatsheet</nuxt-link>
          </div>

          <div class="mx-3">
           <a href="https://forms.gle/Cwo3VupujQJzeoYQ9" class="hover:underline" target="_blank">submit</a>
          </div>
          <div class="mx-3">
           <a href="https://github.com/geongeorge/i-hate-regex" class="hover:underline" target="_blank">github</a>
          </div>

        </div>
           
        </div>

    </div>
  </div>
  </div>
</template>

<script>
import Logo from '~/components/utils/Logo'
import SearchBox from '~/components/utils/SearchBox'
import SearchResult from '~/components/utils/SearchResult'
import NoResults from '~/components/utils/NoResults'
import CommonResults from '~/components/utils/CommonResults'

import jsonData from '~/static/regexdata.json'

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
  methods: {
    searchAction(event) {
      this.query = event
      this.$router.push({path: this.$route.path, query: { q: this.query }})
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
  computed: {
    filteredList() {
      return this.catalog.filter(post => {
        return post.key.toLowerCase().includes(this.query.toLowerCase())
      })
    }
  },
  created() {
    console.log(this.$route.query.q)
    this.query = this.$route.query.q?this.$route.query.q:this.query
    console.log(this.query)
    this.$forceUpdate()
  },
  head () {
    return {
      title: "Regex cheatsheet - I Hate Regex",
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        { hid: 'description', name: 'description', content: "Stop hating regex and start learning." }
      ]
    }
  }
};
</script>

<style>
</style>
