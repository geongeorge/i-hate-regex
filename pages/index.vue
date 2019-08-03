<template>
<div>
  <div class="container mx-auto md:mt-5 lg:mt-20 px-4 max-w-2xl">
    <div class="text-center">
      <Logo></Logo>
      <p
        class="text-gray-600 mt-4"
      >
      <!-- <a href="">#metoo</a> -->
      <input class="bg-gray-200 text-3xl appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-200" id="inline-full-name" type="text" placeholder="Search">
      </p>
    </div>
  </div>
  </div>
</template>

<script>
import Logo from '~/components/Logo'
export default {
  components: {
    Logo
  }
};
</script>

<style>
</style>
