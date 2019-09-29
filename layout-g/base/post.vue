<template>
<div>
  <NavBar @sidebarStateChanged="toggleSidebar"></NavBar>
  <div class="min-h-screen md:flex">
    <div class="static h-full inset-0 h-full bg-gray-100 z-20 flex-none w-full lg:w-1/5 bg-gray-200 text-gray-700"
    :class="{'hidden lg:block': !sidebar}">
    <div class="fixed bg-gray-200 h-screen w-full lg:w-1/5">

    
        <div class="text-center mt-5 pt-2">
          <a href="/" class="group">
            <h2 class="text-2xl">i<span class="font-bold group-hover:text-red-600">Hate</span>Regex</h2>
          </a>
        </div>
        <div class='mt-5 px-2'>
          <SideBarSearch></SideBarSearch>
        </div>
        </div>
    </div>
    <div class="flex-1 bg-white lg:w-4/5 lg:static text-gray-700">
        <div class="container mx-auto md:mt-5 lg:mt-20 px-2 max-w-4xl text-left">
            <slot></slot>
        </div>
        <!-- footer -->
        <div class="bg-gray-300 mt-6 h-24 w-full shadow-inner">
          <div class="flex h-full w-full justify-center items-center">
            <div class="px-2">iHateRegex</div>
          </div>
        </div>
    </div>
    </div>
    
    </div>
</template>
<script>
import SideBarSearch from '~/components/utils/SideBarSearch'
import NavBar from './navbar'
export default {
  components: {
    SideBarSearch,
    NavBar
  },
  data() {
    return {
      sidebar: false
    }
  },
  methods : {
  toggleSidebar(evt) {
    this.sidebar = evt
  }
  }
}
</script>
<style>
html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

</style>
