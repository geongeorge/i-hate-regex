<template>
  <div>
    <div>
      <form autocomplete="off" method="post" action>
        <input
          class="bg-gray-300 text-1xl appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-gray-100 focus:border-gray-200"
          id="inline-full-name"
          type="text"
          placeholder="Search"
          v-model="query"
          @keyup="fuseSearch"
        />
      </form>
    </div>
    <div class="" v-if="query">
      <SearchResult v-for="(item, key) in searchResults" :key="key" :id="item.id" :title="item.title" :addclass="['mt-0']">
        {{item.firstdescr.substring(0,15) + '...'}}
        </SearchResult>
    </div>
    <div class="mx-2 mt-5" v-else>
        <h3 class="font-bold">Related:</h3>
    </div>
  </div>
</template>

<script>
import jsonData from "~/static/regexdata.json";
import SearchResult from '~/components/utils/SearchResult'
export default {
    components: {
        SearchResult,
    },
  data() {
    return {
      query: "",
      catalog: jsonData,
      searchResults: []
    };
  },
  mounted() {},
  methods: {
    fuseSearch() {
      let options = {
        shouldSort: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ["title", "firstdescr", "tags"]
      };
      this.$search(this.query, this.catalog, options).then(results => {
        this.searchResults = results;
      });
    }
  }
};
</script>

<style>
</style>