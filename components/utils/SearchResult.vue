<template>
  <div class="px-3 py-2 rounded text-gray-600 text-left" :class="addclass">
    <a :href="'/expr/' + id">
      <h2 class="text-black text-xl hover:underline">{{ title }}</h2>
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
