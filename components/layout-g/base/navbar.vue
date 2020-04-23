<template>
  <div>
    <div class="float-right z-30 fixed top-0 right-0 m-1 mt-4">
      <SidebarToggle @sidebarStateChanged="toggleSidebar" />
    </div>
    <div class="clearfix" />
  </div>
</template>

<script>
import SidebarToggle from '~/components/utils/SideBarToggleButton'

export default {
  components: {
    SidebarToggle
  },
  methods: {
    toggleSidebar(evt) {
      this.$emit('sidebarStateChanged', evt)
    }
  }
}
</script>

<style></style>
