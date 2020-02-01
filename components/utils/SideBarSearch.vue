<template>
  <div class="flex flex-col h-full">
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
    <div class="overflow-y-scroll">
      <div class="" v-if="query">
        <SearchResult v-for="(item, key) in searchResults" :key="key" :id="item.id" :title="item.title" :addclass="['mt-0']">
          {{item.firstdescr.substring(0,25) + '...'}}
          </SearchResult>
      </div>
      <!-- <button @click="relatedSearch()">clikc</button> -->
      <div class="mx-2 mt-5" v-if="!query && related.length!=0">
          <h3 class="font-bold">Related:</h3>
      </div>
    </div>
    
    <div class="w-full absolute bottom-0 border-t py-3 px-2 bg-gray-200 left-0">
      <!-- <span class="bg-blue-600 p-1 rounded-lg font-bold hover:underline text-white">
      <a href="https://twitter.com/geongeorgek" class="" target="_blank">
      follow @geongeorgek
      </a>
      </span> -->
      <a href="https://github.com/geongeorge/i-hate-regex" class="hover:underline" target="_blank">
      <p class="my-2">contribute on github</p>
      </a>
      <a href="https://forms.gle/Cwo3VupujQJzeoYQ9" class="hover:underline" target="_blank">
      <p class="my-2">Submit regex</p>
      </a>
      <a href="https://www.buymeacoffee.com/geon" class="hover:underline" target="_blank">
      <p class="my-2">Buy me a coffee</p>
      </a>
      <span class="">
<a href="https://www.producthunt.com/posts/i-hate-regex?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-i-hate-regex" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=182905&theme=dark" alt="i Hate Regex - regex cheatsheet for the haters | Product Hunt Embed" style="width: 250px; height: 54px;" width="250px" height="54px" /></a>
      </span>
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
      searchResults: [],
      related:[]
    };
  },
  mounted() {
    this.relatedSearch();
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
        keys: ["title", "firstdescr", "tags"]
      };
      this.$search(this.query, this.catalog, options).then(results => {
        this.searchResults = results;
      });
    },
    relatedSearch() {
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
        this.related = results;
      });
    }
  }
};
</script>

<style>
</style>