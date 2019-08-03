<template>
<div>
  <div class="container mx-auto md:mt-5 lg:mt-20 px-4 max-w-2xl">
    <div class="text-center">
      <Logo></Logo>
      <p class="text-gray-600 my-4">
      You too huh? I thought you code well
      </p>
      <SearchBox @changed="searchAction"></SearchBox>
      <div v-if="query">
        <SearchResult v-for="(item, key) in searchResults" :key="key" :title="item.key">
        {{item.description}}

      </SearchResult>
      </div>
      <div v-else>

<div class="flex flex-wrap mt-4 -mx-2">
  <div class="w-1/2 sm:w-1/3 md:w-1/3 px-2 mt-2">
    <div class="h-12 shadow rounded"></div>
  </div>
  <div class="w-1/2 sm:w-1/3 md:w-1/3 px-2 mt-2">
    <div class="h-12 shadow rounded"></div>
  </div>
  <div class="w-1/2 sm:w-1/3 md:w-1/3 px-2 mt-2">
    <div class="h-12 shadow rounded"></div>
  </div>
  <div class="w-1/2 sm:w-1/3 md:w-1/3 px-2 mt-2">
    <div class="h-12 shadow rounded"></div>
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

import jsonData from '~/static/regdata.json'

export default {
  components: {
    Logo,
    SearchBox,
    SearchResult
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
        keys: [
          "key",
          "description",
          "tags"
        ]
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
  }
};
</script>

<style>
</style>
