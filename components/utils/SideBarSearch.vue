<template>
  <div class="flex flex-col h-full">
    <div>
      <form autocomplete="off" method="post" action>
        <input
          v-model="query"
          class="textbox-gray"
          type="text"
          placeholder="Search"
          @keyup="fuseSearch"
        />
      </form>
    </div>
    <div class="overflow-y-auto">
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
      <div v-if="!query && related.length !== 0" class="">
        <h3 class="font-bold mt-2">
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

    <div class="w-full absolute bottom-0 px-3 left-0">
      <div class="border-t py-1">
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
      </div>
      <div class="border-t py-2">
        <TwitterButton></TwitterButton>
      </div>
    </div>
  </div>
</template>

<script>
import jsonData from "~/static/regex/data.json";
import SearchResult from "~/components/utils/SearchResult";
import TwitterButton from "./TwitterButton";

export default {
  components: {
    SearchResult,
    TwitterButton
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
    };
  },
  mounted() {
    // Search for related
    setTimeout(this.relatedSearch, 500);
  },
  methods: {
    fuseSearch() {
      const options = {
        shouldSort: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ["title", "description", "tags"]
      };
      this.$search(this.query, this.catalog, options).then(results => {
        this.searchResults = results.slice(0, 3); // top 3 search result only
      });
    },
    relatedSearch() {
      const options = {
        shouldSort: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ["title", "description", "tags"]
      };

      // Don't show related if there are no tags or regex
      if (!this.tags) return;

      // Don't show more than 3 related
      const noOfRelated = 3;
      // Initialize to empty temporary array
      const relatedTemp = [];

      for (const tag of this.tags)
        this.$search(tag, this.catalog, options).then(results => {
          // Don't show the same product
          // Filter the id
          relatedTemp.push(...results.filter(elm => elm.id !== this.id));
          // Slice to max length
          if (relatedTemp.length >= noOfRelated) {
            this.related = relatedTemp.slice(0, noOfRelated);
          }
        }); // eslint-disable-line
    }
  }
};
</script>

<style></style>
