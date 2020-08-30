import Vue from "vue";

import "vue-awesome/icons/paper-plane";
import "vue-awesome/icons/magic";
import "vue-awesome/icons/mug-hot";
import "vue-awesome/icons/brands/github";

import Icon from "vue-awesome/components/Icon";

Icon.register({
  flag: {
    width: 24,
    height: 24,
    raw:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-flag"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>'
  },
  copy: {
    width: 24,
    height: 24,
    raw:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-copy"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
  }
});

// globally (in your main .js file)
Vue.component("v-icon", Icon);
