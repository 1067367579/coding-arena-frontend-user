<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <Transition name="route-rise" mode="out-in" appear>
      <component :is="Component" :key="route.fullPath" />
    </Transition>
  </RouterView>
</template>

<style>
.route-rise-enter-active,
.route-rise-leave-active {
  transition:
    opacity var(--motion-page, 320ms) var(--motion-spring-soft, cubic-bezier(0.2, 0.9, 0.2, 1)),
    transform var(--motion-page, 320ms) var(--motion-spring-soft, cubic-bezier(0.2, 0.9, 0.2, 1)),
    filter var(--motion-page, 320ms) var(--motion-spring-soft, cubic-bezier(0.2, 0.9, 0.2, 1));
  will-change: opacity, transform, filter;
}

.route-rise-enter-from {
  opacity: 0;
  transform: translate3d(0, 20px, 0) scale(0.992);
  filter: blur(6px);
}

.route-rise-leave-to {
  opacity: 0;
  transform: translate3d(0, -8px, 0) scale(0.996);
  filter: blur(4px);
}

@media (prefers-reduced-motion: reduce) {
  .route-rise-enter-active,
  .route-rise-leave-active {
    transition: none !important;
  }

  .route-rise-enter-from,
  .route-rise-leave-to {
    opacity: 1;
    transform: none;
    filter: none;
  }
}
</style>
