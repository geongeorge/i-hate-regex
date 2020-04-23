<template>
  <div class="container mx-auto md:pt-5 lg:pt-20 px-4 max-w-2xl">
    <div class="text-center">
      <logo />
      <h1 v-if="error.statusCode === 404" class="text-2xl">
        Page not found
      </h1>
      <h1 v-else>
        An error occurred
      </h1>
      <nuxt-link to="/" class="text-red-600 hover:underline">
        go back to home page
      </nuxt-link>
    </div>
  </div>
</template>

<script>
import Logo from '~/components/utils/Logo'
export default {
  components: {
    Logo
  },
  props: ['error']
}
</script>
