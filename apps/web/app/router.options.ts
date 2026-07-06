import type { RouterConfig } from '@nuxt/schema';

export default <RouterConfig>{
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        top: 0,
      };
    }

    return {
      left: 0,
      top: 0,
    };
  },
};
