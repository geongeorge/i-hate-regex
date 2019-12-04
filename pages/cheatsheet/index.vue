<template>
  <post
  >
    <div>
        <a href="#">
      <h1 class="text-2xl group">
        <span class="group-hover:text-red-600">#</span> 
        cheatsheet
      </h1>
    </a>
    <p class="text-sm text-gray-500">
        tiny regex cheatsheet
    </p>

    <CheatTable :showAll="true">

    </CheatTable>

    <p class="mt-5">
        Cheatsheet adapted from <a class="text-green-600" href="https://dev.to/catherinecodes/a-regex-cheatsheet-for-all-those-regex-haters-and-lovers--2cj1">Catherine's post</a>
    </p>
    </div>
  </post>
</template>

<script>
import post from "~/components//layout-g/base/post.vue";
import CheatTable from "~/components/post-components/CheatTable";
export default {
  components: {
    post,
    CheatTable
  },
  head () {
    return {
      title: "Regex cheatsheet - Regular expressions for the common man",
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        { hid: 'description', name: 'description', content: "A regular expression cheatsheet that you can refer to. Simple examples and explainations." }
      ]
    }
  }

};
</script>

<style>
</style>