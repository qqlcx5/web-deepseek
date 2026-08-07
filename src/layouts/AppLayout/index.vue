<script setup lang="ts">
import DesktopLayout from '@/layouts/LayoutDesktop/index.vue';
import MobileLayout from '@/layouts/LayoutMobile/index.vue';
import { useBreakpoint } from '@/hooks/useScreen';
import { useLayoutStore } from '@/stores/modules/layout';
import { watch } from 'vue';

const breakpoint = useBreakpoint();
const layoutStore = useLayoutStore();

// 同步断点到 store
watch(breakpoint, (bp) => {
  layoutStore.setBreakpoint(bp);
}, { immediate: true });
</script>

<template>
  <MobileLayout v-if="breakpoint === 'mobile'" />
  <DesktopLayout v-else />
</template>
