<template>
  <expr :iregex="new RegExp(myregex.regex)" :iflag="myregex.flag" :imatchText="myregex.matchText" :eHeight="myregex.embedHeight">
    <span slot="title">{{myregex.title}}</span>

    <span slot="tagline">{{myregex.tagline}}</span>

    <p
      slot="firstdescr"
    >{{myregex.firstdescr}}</p>

    <div slot="seconddescr">
      <p v-html="myregex.seconddescr"></p>
      <br />
      <CheatTable :inputRegex="myregex.cheatRegex"></CheatTable>
    </div>
  </expr>
</template>

<script>
import expr from "~/layout-g/expr.vue";
import CheatTable from "~/components/post-components/CheatTable";
import regexdata from "~/static/regexdata.json"
export default {
  components: {
    expr,
    CheatTable
  },
  data() {
    return {
        // regex: regexdata
        id: this.$route.params.id
    };
  },
  computed: {
      myregex() {
          return regexdata.find((val)=>{
              return val.id == this.id
          })
      }
  },
  mounted() {

  }
};
</script>

<style>
</style>