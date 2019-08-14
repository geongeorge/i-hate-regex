<template>
  <expr 
  :iregex='regex'
  :iflag='flag'
  :imatchText='matchText'
  :eHeight='embedHeight'
  >
    <template slot="title">username</template>

    <template slot="tagline">match a username</template>

    <template
      slot="firstdescr"
    >Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus, reiciendis officiis harum quas tempora cupiditate laborum aliquid cumque magni voluptatum.</template>

    <template slot="seconddescr">
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus, reiciendis officiis harum quas tempora cupiditate laborum aliquid cumque magni voluptatum.</p>
      <br />
      <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Neque, dolore minus. Mollitia eius, voluptatem optio delectus repudiandae cupiditate, perferendis corporis culpa veritatis suscipit eligendi? Hic fugiat esse quae quos pariatur.</p>
    </template>
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
      regex: /^[a-z0-9_-]{3,15}$/gm,
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