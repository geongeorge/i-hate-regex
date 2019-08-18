<template>
  <div class="z-30 lg:hidden">
    <button 
    v-if="!opened"
    @click="toggleState"
    type="button" id="sidebar-open" class="flex px-6 items-center  text-gray-500 focus:outline-none focus:text-gray-700">
              <svg class="fill-current w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path></svg>
    </button>
    <button
    v-else
      type="button"
      id="sidebar-close"
       @click="toggleState"
      class="flex px-6 items-center text-gray-500 focus:outline-none focus:text-gray-700"
    >
      <svg class="fill-current w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path
          d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z"
        />
      </svg>
    </button>
  </div>
</template>

<script>
export default {
    data() {
        return {
            opened: false
        }
    },
    watch: {
        opened: function() {
            this.$emit('sidebarStateChanged', this.opened)
        }
    },
    methods : {
        toggleState() {
            this.opened = !this.opened
        }
    }
};
</script>

<style>
</style>