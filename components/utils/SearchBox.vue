<template>
  <div>
    <form autocomplete="off" method="post" action="">
      <input
        v-model="query"
        class="textbox text-2xl"
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
    };
  },
  mounted() {
    if (this.initQuery) {
      this.query = this.initQuery;
      this.queryUpdated();
    }
  },
  methods: {
    queryUpdated() {
      this.$emit("changed", this.query);
    }
  }
};
</script>

<style></style>
