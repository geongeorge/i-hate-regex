<template>
  <div class="p-3 rounded text-gray-600 text-left" :class="addclass">
    <a :href="'/expr/' + id">
      <h2 class="text-black text-lg hover:underline">{{ title }}</h2>
    </a>
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    title: { default: "" },
    id: { default: "" },
    addclass: { default: () => ["mt-6"] }
  }
}
</script>

<style></style>
