<template>
  <div>
    <NavBar @sidebarStateChanged="toggleSidebar" />
    <div class="post-wrapper">
      <div
        class="static-sidebar-wrapper"
        :class="{ 'hidden lg:block': !sidebar }"
      >
        <div class="main-sidebar">
          <div class="text-center mt-5 pt-2">
            <a href="/" class="group">
              <h2 class="text-2xl">
                i<span class="font-bold group-hover:text-red-600">Hate</span>Regex
              </h2>
            </a>
          </div>
          <div class="mt-5 px-2">
            <client-only>
              <SideBarSearch :id="id" :tags="tags" />
            </client-only>
          </div>
        </div>
      </div>
      <div class="post-content">
        <div class="container mx-auto md:mt-5 lg:mt-20 px-2 text-left">
          <slot />
        </div>
        <!-- footer -->
        <MainFooter></MainFooter>
      </div>
    </div>
  </div>
</template>
<script>
import SideBarSearch from "~/components/utils/SideBarSearch";
import MainFooter from "~/components/layouts/base/footer";
import NavBar from "./navbar";
export default {
  components: {
    SideBarSearch,
    NavBar,
    MainFooter
  },
  props: {
    tags: { default: () => [] },
    id: { default: "" }
  },
  data() {
    return {
      sidebar: false
    };
  },
  methods: {
    toggleSidebar(evt) {
      this.sidebar = evt;
    }
  }
};
</script>
<style></style>
