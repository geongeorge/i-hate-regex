<template>
  <div class="px-3 py-2 rounded text-lg text-left" :class="addclass">
    <a :href="'/expr/' + id">
      <h2 class="text-base fade-effect">{{ title }}</h2>
    </a>
    <p class="text-sm">
      <slot />
    </p>
  </div>
</template>

<script>
export default {
  props: {
    title: { default: "" },
    id: { default: "" },
    addclass: { default: () => ["mt-6"] }
  }
};
</script>

<style>
.fade-effect {
  opacity: 0.7;
  transition: opacity 200ms ease-out;
}
.fade-effect:hover {
  opacity: 1;
}
</style>
