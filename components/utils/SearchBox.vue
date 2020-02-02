<template>
  <div>
    <form autocomplete="off" method="post" action="">
      <input
        id="inline-full-name"
        v-model="query"
        class="bg-gray-200 text-3xl appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-gray-200"
        type="text"
        placeholder="Search"
        @keyup="queryUpdated"
      />
    </form>
  </div>
</template>

<script>
export default {
  props: {
    initQuery: { default: "" }
  },
  data() {
    return {
      query: ""
    }
  },
  mounted() {
    if (this.initQuery) {
      this.query = this.initQuery
      this.queryUpdated()
    }
  },
  methods: {
    queryUpdated() {
      this.$emit("changed", this.query)
    }
  }
}
</script>

<style></style>
