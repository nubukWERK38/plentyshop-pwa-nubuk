export default defineNuxtPlugin(() => {
  const router = useRouter();

  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  router.afterEach((to, from) => {
    if (to.fullPath === from.fullPath || to.hash) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto',
        });
      });
    });
  });
});
