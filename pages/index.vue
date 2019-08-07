<template>
<div>
  <div class="container mx-auto md:pt-5 lg:pt-20 px-4 max-w-2xl">
    <div class="text-center">
      <Logo></Logo>
      <p class="text-gray-600 my-4">
      Lorem, ipsum dolor sit amet consectetur adipisicing elit.{{searchResults.length}}
      </p>
      <SearchBox :initQuery="query" @changed="searchAction"></SearchBox>
      <div v-if="query">
        <SearchResult v-for="(item, key) in searchResults" :key="key" :title="item.key">
        {{item.description}}
        </SearchResult>

        <NoResults v-if="searchResults.length < 1">
        </NoResults>
      </div>
      <div v-else>
          <CommonResults></CommonResults>
      </div>
      <p class="text-gray-600 mt-5">
            <a href="#" class="hover:underline">see all</a>
        </p>
      

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

import jsonData from '~/static/regdata.json'

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
  },
  created() {
    console.log(this.$route.query.q)
    this.query = this.$route.query.q?this.$route.query.q:this.query
    console.log(this.query)
    this.$forceUpdate()
  }
};
</script>

<style>
</style>
