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
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus, reiciendis officiis harum quas tempora cupiditate laborum aliquid cumque magni voluptatum.</p>
      <br />
      <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Neque, dolore minus. Mollitia eius, voluptatem optio delectus repudiandae cupiditate, perferendis corporis culpa veritatis suscipit eligendi? Hic fugiat esse quae quos pariatur.</p>
    </div>
  </expr>
</template>

<script>
import expr from "~/layout-g/expr.vue";
export default {
  components: {
    expr
  },
  data() {
    return {
      regex: /^[a-z0-9_-]{3,15}$/,
      flag: "gm",
      matchText: [
        "lorem",
        "geon",
        "gr3at",
        "a",
        "ab",
        "abc",
        "abcd",
        "yo yossj",
        "mahga",
        "abcdefghijklmnopqrst"
      ],
      embedHeight: 300
    };
  }
};
</script>

<style>
</style>