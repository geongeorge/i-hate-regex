<template>
  <div
    class="modal absolute w-full h-full top-0 left-0 flex items-center justify-center z-40"
    :class="{ 'opacity-0 pointer-events-none': !modelShow }"
  >
    <div
      class="modal-overlay absolute w-full h-full bg-black opacity-25 top-0 left-0 cursor-pointer z-10"
      @click="closeModelEmit"
    />
    <div
      class="absolute w-full md:w-1/2 bg-white rounded-sm shadow-lg flex flex-col text-2xl p-3 md:px-5 z-20"
    >
      <h2>Regex Flags</h2>
      <div v-for="(flag, key) in flaglist" :key="key">
        <label class="font-bold">
          <input
            v-model="myselections"
            class="mr-2 leading-tight"
            type="checkbox"
            :value="flag.flag"
          />
          <span class="text-md">{{ flag.flag }}</span>
        </label>
        <span
          class="text-gray-500 text-sm hover:underline group cursor-pointer"
          @click="flag.showDescr = !flag.showDescr"
        >
          {{ flag.title }}
          <span class="opacity-0 group-hover:opacity-100">?</span>
        </span>
        <TransitionExpand>
          <div v-if="flag.showDescr">
            <div
              class="text-sm text-gray-500 border-gray-400 border p-2 rounded"
            >
              {{ flag.descr }}
            </div>
          </div>
        </TransitionExpand>
      </div>
    </div>
  </div>
</template>

<script>
import TransitionExpand from "../TransitionExpand";
export default {
  components: {
    TransitionExpand
  },
  props: {
    modelShow: { default: false },
    selections: { default: () => ["g", "m"] }
  },
  data() {
    return {
      myselections: [],
      flaglist: [
        {
          flag: "g",
          showDescr: false,
          title: "global match",
          descr: "find all matches rather than stopping after the first match"
        },
        {
          flag: "i",
          showDescr: false,
          title: "ignore case",
          descr: "if u flag is also enabled, use Unicode case folding"
        },
        {
          flag: "m",
          showDescr: false,
          title: "multiline",
          descr:
            "treat beginning and end characters (^ and $) as working over multiple lines "
        },
        {
          flag: "s",
          showDescr: false,
          title: "dotAll",
          descr: "allows . to match newlines"
        },
        {
          flag: "u",
          showDescr: false,
          title: "unicode",
          descr: "treat pattern as a sequence of Unicode code points "
        },
        {
          flag: "y",
          showDescr: false,
          title: "sticky",
          descr:
            "matches only from the index indicated by the lastIndex property of this regular expression"
        }
      ]
    };
  },
  watch: {
    modelShow: function(newv, oldv) {
      // eslint-disable-line
      this.flaglist = this.flaglist.map(ele => {
        ele.showDescr = false;
        return ele;
      });
      //   console.log("toggling", newv);
    },
    myselections: {
      handler: function(newv, oldv) {
        // eslint-disable-line
        this.$emit("selected", this.myselections);
      },
      deep: true
    }
  },
  mounted() {
    // setting prop property to data var
    this.myselections = this.selections;
  },
  methods: {
    checkSelection(str) {
      return this.myselections.includes(str);
    },
    closeModelEmit() {
      this.$emit("closeModal", true);
    }
  }
};
</script>

<style>
.modal {
  transition: opacity 0.25s ease;
}
</style>
