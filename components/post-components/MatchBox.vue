<template>
  <div>
    <div class="flex w-full flex-row">
      <div class="text-sm float-right mr-2">
        <a
          href="#"
          class="text-gray-500 hover:underline"
          @click="displayMatches =! displayMatches"
        >{{ showText }}</a>
      </div>
    </div>
    <transition-expand>
    <div v-if="displayMatches">
      <div
        class="text-gray-600 text-lg p-3 rounded focus:outline-none bg-blue-100 mb-2"
        contenteditable="true"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        id="matchbox"
      >Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aspernatur, cupiditate.Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aspernatur, cupiditate.Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aspernatur, cupiditate.Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aspernatur, cupiditate.
      </div>
      </div>
    </transition-expand>
  </div>
</template>

<script>
import TransitionExpand from './TransitionExpand'
export default {
  data() {
    return {
      showText: "show matches",
      displayMatches: false
    };
  },
  components:{
      TransitionExpand
  }
}
</script>

<style>
</style>
