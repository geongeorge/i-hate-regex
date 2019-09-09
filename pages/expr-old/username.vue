<template>
  <expr :iregex="regex" :iflag="flag" :imatchText="matchText" :eHeight="embedHeight">
    <span slot="title">username</span>

    <span slot="tagline">match a username</span>

    <p
      slot="firstdescr"
    >
    Alphanumeric string that may include _ and - having a length of 3 to 16 characters.
    </p>

    <div slot="seconddescr">
      <p>
        This expression can be used to find or validate a username field. You may edit the regex to your liking for number of characters and/or types of values
      </p>
      <br />
        <CheatTable  :inputRegex="cheatRegex"></CheatTable>
    </div>
  </expr>
</template>

<script>
import expr from "~/layout-g/expr.vue";
import CheatTable from '~/components/post-components/CheatTable'
export default {
  components: {
    expr,
    CheatTable
  },
  data() {
    return {
      regex: /^[a-z0-9_-]{3,15}$/,
      flag: "gm",
      matchText: [
        "lorem",
        "ipsum",
        "gr3at",
        "a",
        "ab",
        "abc",
        "abcd",
        "abcde",
        "john doe",
        "johnny",
        "abcdefghijklmnopqrst"
      ],
      cheatRegex:[
        "/^/",
        "/$/",
        "/[a-zA-Z0-9]/",
        "/(hello){1,3}/"        
      ],
      embedHeight: 300
    };
  }
};
</script>

<style>
</style>